import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as crypto from "crypto";
import pino from "pino";
import pinoPretty from "pino-pretty";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const logger = pino(pinoPretty());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "./")));

app.use(cors());
app.use(bodyParser.json());

// БД
let tickets = [
  {
    id: crypto.randomUUID(),
    name: "Поменять краску в принтере, ком. 404",
    description: "Принтер HP LJ-1210, картриджи на складе",
    status: false,
    created: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Переустановить Windows, PC-Hall24",
    description: "",
    status: false,
    created: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    name: "Установить обновление KB-31642dv3875",
    description: "Вышло критическое обновление для Windows",
    status: false,
    created: Date.now(),
  },
];

// API
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/tickets", (req, res) => {
  res.json(tickets);
});

app.get("/tickets/:id", (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }
  res.json(ticket);
});

app.post("/tickets", (req, res) => {
  const { name, description } = req.body;
  const newTicket = {
    id: crypto.randomUUID(),
    name,
    description: description || "",
    status: false,
    created: Date.now(),
  };
  tickets.push(newTicket);
  logger.info(`Ticket created: ${newTicket.name}`);
  res.status(201).json(newTicket);
});

app.patch("/tickets/:id", (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }
  Object.assign(ticket, req.body);
  logger.info(`Ticket updated: ${ticket.name}`);
  res.json(ticket);
});

app.delete("/tickets/:id", (req, res) => {
  const index = tickets.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Ticket not found" });
  }
  tickets.splice(index, 1);
  logger.info(`Ticket deleted: ${req.params.id}`);
  res.status(204).end();
});

const port = process.env.PORT || 7070;
app.listen(port, () => {
  logger.info(`Server started: http://localhost:${port}`);
});
