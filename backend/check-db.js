const { sequelize } = require('./models');

async function checkDatabase() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');

    // Show all tables
    const [results] = await sequelize.query("SHOW TABLES");
    console.log('\n📋 Database Tables:');
    console.table(results);

    // Show data in Roles table
    const [roles] = await sequelize.query("SELECT * FROM Roles");
    console.log('\n👥 Roles:');
    console.table(roles);

    // Show Users table structure
    const [usersStructure] = await sequelize.query("DESCRIBE Users");
    console.log('\n👤 Users Table Structure:');
    console.table(usersStructure);

    // Show foreign key constraints
    const [constraints] = await sequelize.query(`
      SELECT 
        TABLE_NAME, COLUMN_NAME, 
        CONSTRAINT_NAME, REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        TABLE_SCHEMA = 'mediconnect_development'
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);
    console.log('\n🔗 Foreign Key Constraints:');
    console.table(constraints);

  } catch (error) {
    console.error('❌ Database error:', error.message);
    if (error.original) {
      console.error('💡 Error details:', error.original);
    }
  } finally {
    await sequelize.close();
  } 
}

checkDatabase();
