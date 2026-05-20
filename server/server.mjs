import http from "node:http";
import fs from "node:fs";

const PORT = 3001;

// проста база (в памʼяті)
let db = {
  products: [],
  orders: []
};

// тестові товари
db.products = [
  {
    id: "1",
    nameUa: "Диван",
    price: 1000,
    vendorName: "Test Vendor",
    stock: 5
  }
];

// helper
function send(res, data) {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(data));
}

// сервер
const server = http.createServer(async (req, res) => {

  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  // GET products
  if (req.url === "/api/products" && req.method === "GET") {
    return send(res, db.products);
  }

  // POST product
  if (req.url === "/api/products" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      const data = JSON.parse(body);

      const product = {
        id: Date.now().toString(),
        ...data
      };

      db.products.push(product);
      send(res, product);
    });

    return;
  }

  // POST order
  if (req.url === "/api/orders" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      const order = JSON.parse(body);

      order.id = Date.now().toString();
      db.orders.push(order);

      send(res, order);
    });

    return;
  }

  send(res, { ok: true });
});

server.listen(PORT, () => {
  console.log("SERVER STARTED http://localhost:" + PORT);
});