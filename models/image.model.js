module.exports = (sequelize, Sequelize) =>{
    const image = sequelize.define("image", {
        imageId:{
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name:{
            type: Sequelize.STRING,
            allowNull: false
        },
        source:{
            type: Sequelize.TEXT('long'),
            allowNull: false
        },
        width:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        height:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        createdDate:{
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
            noupdate: true
        },
        updatedDate:{
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        }
    });

    return image;
};
