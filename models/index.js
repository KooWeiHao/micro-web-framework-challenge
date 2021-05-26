const dbConfig = require("../configs/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    logging: msg =>{console.log(msg)},
    define:{
        underscored: true,
        timestamps: false,
        freezeTableName: true
    }
});

const db = {
    Sequelize: Sequelize,
    sequelize: sequelize,
    image: require("./image.model.js")(sequelize, Sequelize)
};
module.exports = db;
