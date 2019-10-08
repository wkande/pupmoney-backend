## pupmoney-backend
The Simple Expenses Manager using Nodejs/Express.




## Nodejs startup


#### Exports
The value of JWT_SECRET and DB_URLS are in the private SECRETS project. 
These must be set prior to starting Nodejs for the appropriate env (dev, beta, prod).

```BASH
# JWT_SECRET
export JWT_SECRET=<from-secret-project>
# DB_URLS
export DB_URLS=<from-secret-project>
```


Set the node environment.
```BASH
# production
export NODE_ENV=production
# beta
export NODE_ENV=beta
# development
export NODE_ENV=
```

Startup for development.
```bash
DEBUG=pup:* npm start
```


## Versioning
Set the version number in package.json prior to all Git Repo pushes.



## Deployment 
Steps to deploy the backend are based on a simple beta or production process.


#### Heroku Deployment
The Heroku console is setup to pull from GitHub. Use the Heroku console to pull the proper 
branch (beta or master) to the beta or production Heroku servers.

#### Local repo
1. Only work with and push the development_(date) branch
2. Change the package.json version before git add

#### Beta - remote repo
Beta is tested using the TEST scripts and Postman. The Ionic codebase only attaches to dev and prod.
1. Merge development_(dttm) to beta on GitHub
2. Pull beta from Heroku to the Heroku beta project

#### Production - remote repo
1. Merge beta to master on GitHub
2. Pull master from Heroku to the Heroku production project

## Javascript Documentation
- [/docs/overview.md](./docs/_jsdoc/index.html)

## API Documentation
Documentation for all endpoints are in the docs folder. The overview.md file contains is the starting point. 
- [/docs/overview.md](./docs/overview.md)


## Databases
See the pupmoney-database repo README.md.

