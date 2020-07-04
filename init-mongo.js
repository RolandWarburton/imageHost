print("============================================================================")
print("==================== RUNNING MONGO INIT-MONGO.JS SCRIPT ====================")
print("============================================================================")

databases = ["imageHost"]

for (let i = databases.length - 1; i >= 0; i--) {
	db = db.getSiblingDB(databases[i])

	db.createUser({
		user: "roland",
		pwd: "rhinos",
		roles: [{role: "readWrite", db: databases}]
	})
}
