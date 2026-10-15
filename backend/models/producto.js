import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

//definir el modelo Producto
const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false, //no permite datos nulos
        validate: {
            notEmpty: true, //no permite cadena vacía
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imagen: {
        type: DataTypes.BLOB('long'), // almacena el binario en la base de datos (LONGBLOB en MySQL)
        allowNull: true,
    },
    mimetype: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0 
        }
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['Comic' , 'Figura']]
        }
    }
}, {
    tableName: 'productos',
    timestamps: true,
});

export default Producto;