'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, DataTypes) {
    await queryInterface.addColumn(
      'users',
      'username',
      DataTypes.STRING,
    )
  },

  async down (queryInterface, DataTypes) {
    await queryInterface.dropTable('users')
  }
};
