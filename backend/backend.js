"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const fs_1 = require("fs");
const morgan_1 = tslib_1.__importDefault(require("morgan"));
const swagger_ui_express_1 = tslib_1.__importDefault(require("swagger-ui-express"));
const swagger_output_json_1 = tslib_1.__importDefault(require("../backend/swagger-output.json"));
const app = (0, express_1.default)();
const PORT = 3000;
// Middleware to parse request body
app.use(express_1.default.json());
// Add Swagger UI to the app
const options = { swaggerOptions: { tryItOutEnabled: true } };
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default, options));
// Enabled CORS (Cross-Origin Resource Sharing):
app.use((0, cors_1.default)());
// Logger middleware: log all requests to the console
app.use((0, morgan_1.default)("dev"));
app.get("/api/journeys", async (req, res) => {
    // #swagger.tags = ['Journeys']
    // #swagger.summary = 'Read all data from journeys table'
    try {
        const data = await readDataFromFile("journeys");
        if (data) {
            res.send(data.sort((a, b) => a.id - b.id));
        }
        else {
            res.status(404).send({ message: "Hiba az adatok olvasásakor!" });
        }
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
});
app.get("/api/journeys/short", async (req, res) => {
    // #swagger.tags = ['Journeys']
    // #swagger.summary = 'Read limited journey data'
    try {
        const data = await readDataFromFile("journeys");
        if (data) {
            res.send(data
                .map((j) => {
                return {
                    id: j.id,
                    destination: `${j.country} (${j.departure})`,
                };
            })
                .sort((a, b) => a.id - b.id));
        }
        else {
            res.status(404).send({ message: "Hiba az adatok olvasásakor!" });
        }
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
});
app.post("/api/reserve", async (req, res) => {
    // #swagger.tags = ['Reservations']
    // #swagger.summary = 'Create a new reservation'
    /* #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            journeyId: { type: "number" },
                            name: { type: "string" },
                            email: { type: "string" },
                            numberOfParticipants: { type: "number" },
                            lastCovidVaccineDate: { type: "string" },
                            acceptedConditions: { type: "boolean" }
                        },
                        example: {
                            journeyId: 2,
                            name: "Kiss Dóra",
                            email: "kiss.dora@mail.hu",
                            numberOfParticipants: 2,
                            lastCovidVaccineDate: "2024-08-28",
                            acceptedConditions: true
                        }
                    }
                }
            }
        }
    */
    try {
        const data = await readDataFromFile("reservations");
        if (data) {
            const newReservation = req.body;
            newReservation.id = Math.max(...data.map(e => e.id)) + 1;
            if (Object.keys(newReservation).length != 7 || !newReservation.journeyId || !newReservation.name || !newReservation.email || !newReservation.numberOfParticipants || !newReservation.lastCovidVaccineDate || !newReservation.acceptedConditions)
                throw new Error("A kérés mezői nem megfelelők, vagy nem tartalmaznak értéket.");
            data.push(newReservation);
            const response = await saveDataToFile("reservations", data);
            if (response == "OK") {
                res.status(201).send({ id: newReservation.id });
            }
            else {
                res.status(400).send({ message: response });
            }
        }
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
});
// Read operation
// app.get("/read/:id", (req: Request, res: Response) => {
//     const data = readDataFromFile();
//     const item = data.find(item => item.id === parseInt(req.params.id));
//     if (item) {
//         res.send(item);
//     } else {
//         res.status(404).send("Item not found.");
//     }
// });
// Update operation
// app.put("/update/:id", (req: Request, res: Response) => {
//     const data = readDataFromFile();
//     const index = data.findIndex(item => item.id === parseInt(req.params.id));
//     if (index !== -1) {
//         data[index] = req.body;
//         saveDataToFile(data);
//         res.send("Item updated successfully.");
//     } else {
//         res.status(404).send("Item not found.");
//     }
// });
// Delete operation
// app.delete("/delete/:id", (req: Request, res: Response) => {
//     const data = readDataFromFile();
//     const index = data.findIndex(item => item.id === parseInt(req.params.id));
//     if (index !== -1) {
//         data.splice(index, 1);
//         saveDataToFile(data);
//         res.send("Item deleted successfully.");
//     } else {
//         res.status(404).send("Item not found.");
//     }
// });
app.listen(PORT, () => {
    console.log(`Jedlik Json-Backend-Server Swagger: http://localhost:${PORT}/docs`);
});
// Utility functions to read/write data from/to file
async function readDataFromFile(table) {
    try {
        const data = await fs_1.promises.readFile(`db_${table}.json`, "utf8");
        return JSON.parse(data);
    }
    catch (error) {
        return [error.message];
    }
}
async function saveDataToFile(table, data) {
    try {
        await fs_1.promises.writeFile(`db_${table}.json`, JSON.stringify(data, null, 2), "utf8");
        return "OK";
    }
    catch (error) {
        return error.message;
    }
}
//# sourceMappingURL=backend.js.map