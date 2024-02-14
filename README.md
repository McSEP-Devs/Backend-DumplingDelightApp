# DumplingDelight-App-WebServer

- Dumpling Delight is an innovative app designed to enrich the dining experience with a variety of Asian dumplings. It is a gateway to the diverse flavors of Asian cuisine, allowing users to customize their dumplings in terms of filling, wrapping, and cooking method including pre-set combos. This app not only caters to individual tastes but also introduces users to the culinary traditions of China, Korea, Japan, India, Nepal and more. It is a step towards cultural discovery and culinary diversity, enhancing societal culinary knowledge. Additionally, the app offers practical benefits like account management, order tracking, and a 2% cashback reward, making it both enjoyable and user-friendly. For administrators, it simplifies tasks such as order management and menu updates, ensuring a seamless operational flow.

## Getting Started

- Download and unzip the project.

## Running Server

- Rename `config/config-copy.env` to `config/config.env`
- Configure `config/config.env` with your `MONGO_URI`

```--------------------------------------------
    cd Backend-DumplingDelightApp
    npm install (to install dependencies)
    npm run dev (to start development server)
```

## Seeding Data in Database

```--------------------------------------------
    node seeder -d (To delete all data from DB)
    node seeder -i (To import data into DB)
```

## Technology Used

- nodejs
- express
- MongoDB
- Mongoose
- Swagger

## Deployment

- [Dumpling Delight App API](https://dumplingdelight-api.onrender.com/)

## Authors

- Raj Kumar Shahu
- Rajesh Bista
- Tej Prasad Subedi
