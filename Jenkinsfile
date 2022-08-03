pipeline {
  agent {
    docker {
      image 'node:lts-bullseye-slim'
      args '-p 3000:3000'
    }
  }
  stages {
    stage("Build") {
      steps {
          sh "echo 'Starting install'"
          sh "npm install"
          sh "echo 'install successful'"
          sh "echo 'start build'"
          sh "npm build"
          sh "echo 'build successful'"
      }
    }
  }
}