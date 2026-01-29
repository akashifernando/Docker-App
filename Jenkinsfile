pipeline {
    agent any

    environment {
        // Jenkins credentials → type: "Username with password", ID: dockerhub-login
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKERHUB_USERNAME    = 'akashifernando'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/akashifernando/Docker-App.git'
            }
        }

        stage('Build & Push Docker Images') {
            parallel {
                stage('Build & Push Backend') {
                    steps {
                        script {
                            echo "Building & Pushing backend image..."
                            sh 'docker build -t myapp-server:latest -f server/dockerfile server'
                            
                            def backendImageRemote = "${DOCKERHUB_USERNAME}/myapp-server:latest"
                            sh """
                                docker tag myapp-server:latest ${backendImageRemote}
                                echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                                docker push ${backendImageRemote}
                            """
                        }
                    }
                }

                stage('Build & Push Frontend') {
                    steps {
                        script {
                            echo "Building & Pushing frontend image..."
                            sh 'docker build -t myapp-client:latest -f client/dockerfile client'
                            
                            def frontendImageRemote = "${DOCKERHUB_USERNAME}/myapp-client:latest"
                            sh """
                                docker tag myapp-client:latest ${frontendImageRemote}
                                echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                                docker push ${frontendImageRemote}
                            """
                        }
                    }
                }
            }
        }

        stage('Terraform Init & Apply') {
            steps {
                script {
                    dir('terraform') {
                        withCredentials([usernamePassword(credentialsId: 'aws-credentials', passwordVariable: 'AWS_SECRET_ACCESS_KEY', usernameVariable: 'AWS_ACCESS_KEY_ID')]) {
                             sh """
                                echo "Initializing Terraform..."
                                terraform init
                                
                                echo "Applying Terraform..."
                                terraform apply -auto-approve -var="aws_region=us-east-1"
                                
                                echo "Exporting Public IP..."
                                export EC2_PUBLIC_IP=\$(terraform output -raw server_public_ip)
                                echo "EC2 Public IP: \${EC2_PUBLIC_IP}"
                             """
                        }
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    dir('terraform') {
                         def ec2Ip = sh(script: "terraform output -raw server_public_ip", returnStdout: true).trim()
                         
                         sh """
                            echo "Setting permissions for key..."
                            chmod 400 Task-app-key.pem
                            
                            echo "SSHing into EC2 and deploying..."
                            ssh -o StrictHostKeyChecking=no -i Task-app-key.pem ec2-user@${ec2Ip} <<EOF
                                # Update and ensure Docker is running (already in User Data but good to be safe)
                                sudo systemctl start docker
                                
                                # Login to Docker Hub (if private repo, otherwise skip)
                                # echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                                
                                # Pull images
                                docker pull ${DOCKERHUB_USERNAME}/myapp-server:latest
                                docker pull ${DOCKERHUB_USERNAME}/myapp-client:latest
                                
                                # Stop and remove existing containers if any
                                docker stop myapp-server myapp-client || true
                                docker rm myapp-server myapp-client || true
                                
                                # Run Backend
                                docker run -d --name myapp-server -p 5000:5000 ${DOCKERHUB_USERNAME}/myapp-server:latest
                                
                                # Run Frontend
                                docker run -d --name myapp-client -p 3000:3000 ${DOCKERHUB_USERNAME}/myapp-client:latest
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
            echo '✅ Images built and pushed to Docker Hub successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check the stage logs for details.'
        }
    }
}
