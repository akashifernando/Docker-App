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

        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build -t myapp-server:latest -f server/dockerfile server
                    docker build -t myapp-client:latest -f client/dockerfile client
                '''
            }
        }

        stage('Tag Images') {
            steps {
                sh '''
                    docker tag myapp-server:latest ${DOCKERHUB_USERNAME}/myapp-server:latest
                    docker tag myapp-client:latest ${DOCKERHUB_USERNAME}/myapp-client:latest
                '''
            }
        }

        stage('Login Docker Hub') {
            steps {
                sh '''
                    echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login \
                      -u "$DOCKERHUB_CREDENTIALS_USR" \
                      --password-stdin
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
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

                        withCredentials([
                            sshUserPrivateKey(
                                credentialsId: 'aws-credentials',
                                keyFileVariable: 'SSH_KEY',
                                usernameVariable: 'SSH_USER'
                            )
                        ]) {
                            sh """
                                ssh -o StrictHostKeyChecking=no \
                                    -i \$SSH_KEY \
                                    \$SSH_USER@${ec2Ip} << 'EOF'
                                docker pull ${DOCKERHUB_USERNAME}/myapp-server:latest
                                docker pull ${DOCKERHUB_USERNAME}/myapp-client:latest

                                docker stop myapp-server myapp-client || true
                                docker rm myapp-server myapp-client || true

                                docker run -d --name myapp-server -p 5000:5000 \
                                  ${DOCKERHUB_USERNAME}/myapp-server:latest

                                docker run -d --name myapp-client -p 3000:3000 \
                                  ${DOCKERHUB_USERNAME}/myapp-client:latest
                                EOF
                            """
                        }
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
            echo '✅ CI/CD pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs.'
        }
    }
}
