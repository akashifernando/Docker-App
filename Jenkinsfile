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

        stage('Build & Tag Images') {
            steps {
                sh '''
                    echo "Building backend..."
                    docker build -t ${DOCKERHUB_USERNAME}/myapp-server:latest -f server/dockerfile server
                    
                    echo "Building frontend..."
                    docker build -t ${DOCKERHUB_USERNAME}/myapp-client:latest -f client/dockerfile client
                '''
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
                                echo " Connected to EC2 Instance"

                                # Ensure Docker is running
                                sudo systemctl start docker

                                # Pull images
                                docker pull ${DOCKERHUB_USERNAME}/myapp-server:latest
                                docker pull ${DOCKERHUB_USERNAME}/myapp-client:latest

                                # Stop and remove old containers
                                docker stop myapp-server myapp-client || true
                                docker rm myapp-server myapp-client || true

                                # Run new containers
                                docker run -d --name myapp-server -p 5000:5000 ${DOCKERHUB_USERNAME}/myapp-server:latest
                                docker run -d --name myapp-client -p 3000:3000 ${DOCKERHUB_USERNAME}/myapp-client:latest
                                
                                echo " Remote Deployment Finished!"
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
            echo ' CI/CD pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}