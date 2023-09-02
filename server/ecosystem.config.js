module.exports = {
    apps: [{
        name: "my-planit-poker-server",
        script: "./dist/main.js",
        env: {
            "NODE_ENV": "production",
            "NODE_PORT": 80
        }
    }]
}
