'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Post }) {
      // define association here
      this.belongsTo(Post, { foreignKey: 'postId', as: 'post' })
      this.belongsTo(User, { foreignKey: 'authorId', as: 'author' })
    }

    toJSON() {
      return { ...this.get(), id: undefined, postId: undefined, authorId: undefined }
    }
  }
  Comment.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Comment must not be null' },
        notEmpty: { msg: 'Comment must not be empty' },
      }
  },
    createdAt: DataTypes.DATE,
  }, {
    sequelize,
    tableName: 'comments',
    modelName: 'Comment',
  });
  return Comment;
};