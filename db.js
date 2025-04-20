const { Sequelize } = require('sequelize');

// Catalog=admin, User=admin, Password=admin
const sequelize = new Sequelize('admin', 'admin', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false, // Disable logging
});

const UserModel = require('./models/User')(sequelize);

async function setup() {
    // Test database connection
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }

    // Sync models
    try {
        await sequelize.sync({ force: true }) // Remove force in production
        console.log('Database synchronized successfully');
    }
    catch (error) {
        console.error('Error synchronizing database:', error);
        process.exit(1);
    }

    // Create test user
    try {
        await UserModel.create({
            username: 'up0000000',
            password: 'password',
            email: 'up0000000@ac.upatras.gr'
        });
        console.log('Test user created successfully');
    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    }
}

module.exports = {
    UserModel,
    setup
};
