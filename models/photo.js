'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Post }) {
      // define association here
      this.belongsTo(Post, { foreignKey: 'postId', as: 'post' })
    }

    toJSON() {
      return { ...this.get(), id: undefined, photoId: undefined, postId: undefined }
    }
  }
  Photo.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Photo must have a name' },
          notEmpty: { msg: 'Name must not be empty' },
          max: 5,
        }
    },
    createdAt: DataTypes.DATE,
  }, {
    sequelize,
    tableName: 'photos',
    modelName: 'Photo',
  });
  return Photo;
};