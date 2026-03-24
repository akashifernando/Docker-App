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
                    docker --version
                    docker info
                '''
            }
        }

        // ✅ 1. Create EC2 FIRST
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
                            terraform init -input=false
                            terraform apply -auto-approve -input=false
                        '''
                    }
                }
            }
        }

        // ✅ 2. Get EC2 IP
        stage('Get EC2 IP') {
            steps {
                script {
                    env.EC2_IP = sh(
                        script: """
                            cd terraform
                            terraform init -input=false
                            terraform output -raw instance_public_ip
                        """,
                        returnStdout: true
                    ).trim()

                    echo "EC2 IP: ${env.EC2_IP}"
                }
            }
        }

        // ✅ 3. Build Docker Images using EC2 IP
        stage('Build & Tag Images') {
            steps {
                sh "docker build -t ${DOCKERHUB_USERNAME}/myapp-server:latest -f server/dockerfile server"

                sh """
                    docker build \
                    --build-arg REACT_APP_API_URL=http://${EC2_IP}:5000 \
                    -t ${DOCKERHUB_USERNAME}/myapp-client:latest \
                    -f client/dockerfile client
                """
            }
        }

        // ✅ 4. Push Images
        stage('Login & Push') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                    docker push ${DOCKERHUB_USERNAME}/myapp-server:latest
                    docker push ${DOCKERHUB_USERNAME}/myapp-client:latest
                '''
            }
        }

        // ✅ 5. Deploy to EC2
        stage('Deploy to EC2') {
            steps {
                dir('terraform') {
                    sh """
                        chmod 400 Task-app-key.pem
                        
                        ssh -o StrictHostKeyChecking=no -i Task-app-key.pem ec2-user@${EC2_IP} << 'EOF'
                            set -e
                            echo "Connected to EC2 Instance"

                            sudo systemctl start docker
                            docker system prune -af

                            docker network create app-network || true

                            if ! [ "\$(docker ps -q -f name=mongodb-server)" ]; then
                                docker run -d \
                                    --name mongodb-server \
                                    --network app-network \
                                    -v mongo_db_data:/data/db \
                                    mongo:latest
                            fi

                            docker pull ${DOCKERHUB_USERNAME}/myapp-server:latest
                            docker pull ${DOCKERHUB_USERNAME}/myapp-client:latest

                            docker stop myapp-server myapp-client || true
                            docker rm myapp-server myapp-client || true

                            docker run -d \
                                --name myapp-server \
                                --network app-network \
                                -e MONGO_URI=mongodb://mongodb-server:27017/taskdb \
                                -e JWT_SECRET=supersecret_jwt_key \
                                -p 5000:5000 \
                                ${DOCKERHUB_USERNAME}/myapp-server:latest

                            docker run -d \
                                --name myapp-client \
                                --network app-network \
                                -p 3000:3000 \
                                ${DOCKERHUB_USERNAME}/myapp-client:latest

                            sleep 10
                            docker ps
                        EOF
                    """
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