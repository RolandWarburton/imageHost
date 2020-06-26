console.log("==============================================================================================================================")

db.createUser(
	{
		user: "imageHostUser",
		pwd: "rhinos",
		roles: [
			{
				role: "readWrite",
				db: "imageHost"
			}
		]
	}
)
