pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'npm install'
				sh 'npm run server'
            }
        }
        stage('Pushing to S3') {
            steps {
                sh 'aws s3 rm s3://${bucket_name}  --recursive'
                sh 'aws s3 sync dist/ s3://${bucket_name}'
            }
        }
        stage('Cloudfront invalidation') {
            steps {
                sh 'aws cloudfront create-invalidation  --distribution-id ${cloudfront_distro_id}  --paths "/*"'
            }
        }
    }
}
