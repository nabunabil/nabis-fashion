"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCODOrder = processCODOrder;
const order_workflow_service_1 = require("../orders/order-workflow.service");
async function processCODOrder(userId, shipping) {
    return (0, order_workflow_service_1.createOrderFromCart)(userId, "COD", shipping);
}
//# sourceMappingURL=cod.service.js.map