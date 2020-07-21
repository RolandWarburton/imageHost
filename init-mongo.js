/* eslint no-undef: 0 */

print("============================================================================")
print("==================== RUNNING MONGO INIT-MONGO.JS SCRIPT ====================")
print("============================================================================")

require("dotenv").config()

const databases = ["imageHost"]

for (let i = databases.length - 1; i >= 0; i--) {
	const db = db.getSiblingDB(databases[i])

	db.createUser({
		user: "roland",
		pwd: process.env.ACCOUNT_MASTER_PASSWORD,
		roles: ["readWrite"]
	})
}
