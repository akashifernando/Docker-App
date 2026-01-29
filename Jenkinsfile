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

        stage('Build Docker Images from Compose') {
           steps {
        script {
            echo "Building backend image (myapp-server)..."
            sh 'docker build -t myapp-server:latest -f server/dockerfile server'

            echo "Building frontend image (myapp-client)..."
            sh 'docker build -t myapp-client:latest -f client/dockerfile client'
        }
    }
        }

        stage('Tag Images for Docker Hub') {
            steps {
                script {
                    def frontendImageLocal  = 'myapp-client:latest'
                    def backendImageLocal   = 'myapp-server:latest'
                    def frontendImageRemote = "${DOCKERHUB_USERNAME}/myapp-client:latest"
                    def backendImageRemote  = "${DOCKERHUB_USERNAME}/myapp-server:latest"

                    sh """
                        echo "Tagging images for Docker Hub..."
                        docker tag ${frontendImageLocal} ${frontendImageRemote}
                        docker tag ${backendImageLocal}  ${backendImageRemote}
                    """
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    def frontendImageRemote = "${DOCKERHUB_USERNAME}/myapp-client:latest"
                    def backendImageRemote  = "${DOCKERHUB_USERNAME}/myapp-server:latest"

                    sh """
                        echo "Pushing images to Docker Hub..."
                        docker push ${frontendImageRemote}
                        docker push ${backendImageRemote}
                    """
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
