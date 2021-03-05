# BlockCITE - Document Proof of Existence

BlockCITE generates the hash of uploaded document and stores it permanently on the Bitcoin blockchain. 

***Example:***

blockCITE - Hello World!  https://www.smartbit.com.au/tx/a94df4d573314c884dfcbf5a65b803fde0c587478bae7a71fec7867579b2f902

## Getting Started

These instructions will get you a copy of the project up and running on your ***local machine for development***. 

### Prerequisites

* NodeJS
  ```sh
  sudo apt install nodejs
  sudo apt install npm
  ```
* MongoDB
  ```sh
  sudo apt-get install mongodb
  ```
* Docker
  ```sh
  sudo apt install apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
  sudo apt update
  apt-cache policy docker-ce
  sudo apt install docker-ce
  ```
* Docker-Compose
  ```sh

  ```
### Installing
* Clone the project
  ```sh
  git clone git@github.com:hoangan/blockcite-api.git
  ```

## Docker Compose

To spin up the service locally with docker follow this steps:
- Install Docker:
  - macOS: https://docs.docker.com/docker-for-mac/install/
  - linux: https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#os-requirements
- Install Compose:
  - https://docs.docker.com/compose/install/
- Build:

  ```sh
  $ git clone git@github.com:hoangan/blockcite-api.git
  $ cd blockcite-api 
  $ docker-compose up
  ```

## Built With
* [NodeJS](https://nodejs.org/) 
* [MongoDB](https://mongodb.com/)
* [Docker](https://docker.com/)

## Authors

* **An Hoang** - [anhoang](https://github.com/anhoang)