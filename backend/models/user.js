import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Usuario = sequelize.define('Usuario', {
    email : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password : {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
    }
    
}, 
{
    tableName: 'usuarios',
    timestamps: true,
});

export default Usuario;