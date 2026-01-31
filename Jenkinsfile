pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-login')
        DOCKERHUB_USERNAME    = 'akashifernando'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/akashifernando/Docker-App.git'
            }
        }

        stage('Verify Docker') {
            steps {
                sh '''
                    echo "--- Local Docker Info ---"
                    docker --version
                    docker info
                '''
            }
        }

        stage('Terraform Init & Apply') {
            steps {
                dir('terraform') {
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'aws-credentials',
                            usernameVariable: 'AWS_ACCESS_KEY_ID',
                            passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                        )
                    ]) {
                        sh '''
                            terraform init
                            terraform apply -auto-approve
                        '''
                    }
                }
            }
        }

        stage('Build & Tag Images') {
            steps {
                script {
                    // Fetch the fresh EC2 IP from Terraform outputs
                    def ec2Ip = sh(
                        script: "cd terraform && terraform output -raw instance_public_ip",
                        returnStdout: true
                    ).trim()

                    echo "Building backend..."
                    sh "docker build -t ${DOCKERHUB_USERNAME}/myapp-server:latest -f server/dockerfile server"
                    
                    echo "Building frontend with API URL: http://${ec2Ip}:5000"
                    // Inject the EC2 IP into the React build process
                    sh """
                        docker build \
                        --build-arg REACT_APP_API_URL=http://${ec2Ip}:5000 \
                        -t ${DOCKERHUB_USERNAME}/myapp-client:latest \
                        -f client/dockerfile client
                    """
                }
            }
        }

        stage('Login & Push') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                    docker push ${DOCKERHUB_USERNAME}/myapp-server:latest
                    docker push ${DOCKERHUB_USERNAME}/myapp-client:latest
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                dir('terraform') {
                    script {
                        def ec2Ip = sh(
                            script: "terraform output -raw instance_public_ip",
                            returnStdout: true
                        ).trim()
                        
                        echo "Deploying to EC2 IP: ${ec2Ip}" 

                        sh """
                            chmod 400 Task-app-key.pem
                            
                            ssh -o StrictHostKeyChecking=no -i Task-app-key.pem ec2-user@${ec2Ip} << 'EOF'
                                set -e
                                echo "Connected to EC2 Instance"
                                
                                # 1. Clean up old data
                                docker system prune -af
                                sudo systemctl start docker

                                # 2. Create internal bridge network
                                docker network create app-network || true

                                # 3. Start MongoDB locally with persistence
                                if ! [ "\$(docker ps -q -f name=mongodb-server)" ]; then
                                    docker run -d \
                                        --name mongodb-server \
                                        --network app-network \
                                        -v mongo_db_data:/data/db \
                                        mongo:latest
                                fi

                                # 4. Pull and Restart App Containers
                                docker pull ${DOCKERHUB_USERNAME}/myapp-server:latest
                                docker pull ${DOCKERHUB_USERNAME}/myapp-client:latest

                                docker stop myapp-server myapp-client || true
                                docker rm myapp-server myapp-client || true

                                # Start Backend linked to local Mongo
                                docker run -d \
                                    --name myapp-server \
                                    --network app-network \
                                    -e MONGO_URI=mongodb://mongodb-server:27017/taskdb \
                                    -e JWT_SECRET=supersecret_jwt_key \
                                    -p 5000:5000 \
                                    ${DOCKERHUB_USERNAME}/myapp-server:latest

                                # Start Frontend
                                docker run -d \
                                    --name myapp-client \
                                    --network app-network \
                                    -p 3000:3000 \
                                    ${DOCKERHUB_USERNAME}/myapp-client:latest
                                
                                echo "Waiting for containers to initialize..."
                                sleep 15
                                
                                echo "--- Server Container Logs ---"
                                docker logs myapp-server
                                echo "---------------------------"
                                
                                echo "--- Docker PS (All) ---"
                                docker ps -a
                                echo "-----------------------"
                                
                                echo "Remote Deployment Finished!"
                                docker ps
EOF
                        """
                    }
                }
            }
        }

        stage('Clean Up') {
            steps {
                sh 'docker system prune -af || true'
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}