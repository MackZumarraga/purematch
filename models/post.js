'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Photo }) {
      // define association here
      this.belongsTo(User, { foreignKey: 'userId', as: 'user' })
      this.hasMany(Photo, { foreignKey: 'postId', as: 'photos' })
    }

    toJSON() {
      return { ...this.get(), id: undefined, userId: undefined }
    }
  }
  Post.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Post must have a title' },
        notEmpty: { msg: 'Post title must not be empty' },
      }
    },
    description: DataTypes.STRING,
    photo: DataTypes.STRING,
    createdAt: DataTypes.DATE,
  }, {
    sequelize,
    tableName: 'posts',
    modelName: 'Post',
  });
  return Post;
};