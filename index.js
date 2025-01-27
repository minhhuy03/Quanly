
var productListVisible = false;
var products = [];
var importBills = [];
var receiptFormVisible = false;
var receipts = [];
var receiptDetails = [];

document.addEventListener("DOMContentLoaded", function () {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            products = JSON.parse(xhr.responseText);
            init();
        }
    };
    xhr.open("GET", "products.json", true);
    xhr.send();
});

function init() {
    viewProductList();
    populateProductOptions();
}

function populateProductOptions() {
    var productSelect = document.getElementById("productId");
    for (var i = 0; i < products.length; i++) {
        var option = document.createElement("option");
        option.value = products[i].id;
        option.text = products[i].name;
        productSelect.add(option);
    }
}

function toggleProductList() {
    productListVisible = !productListVisible;
    toggleVisibility("list", productListVisible);

    if (productListVisible) {
        viewProductList();
    }
}

function toggleVisibility(elementId, isVisible) {
    var element = document.getElementById(elementId);
    element.style.display = isVisible ? "table" : "none";
}

function viewProductList() {
    var list = document.getElementById("list");
    // Sử dụng vòng lặp để xóa tất cả các dòng, trừ dòng header
    for (var i = list.rows.length - 1; i > 0; i--) {
        list.deleteRow(i);
    }

    for (var i = 0; i < products.length; i++) {
        var row = list.insertRow(-1);
        var idCell = row.insertCell(0);
        idCell.innerHTML = products[i].id;

        var nameCell = row.insertCell(1);
        nameCell.innerHTML = products[i].name;

        var idCategoryCell = row.insertCell(2)
        idCategoryCell.innerHTML = products[i].idCategory;

        var priceInputCell = row.insertCell(3);
        priceInputCell.innerHTML = products[i].priceInput;

        var priceOutputCell = row.insertCell(4);
        priceOutputCell.innerHTML = calculatePriceOutput(products[i].priceInput);
    }
}

function calculatePriceOutput(priceInput) {
    var tax = priceInput * 0.1;
    var profit = priceInput * 0.3;
    return priceInput + tax + profit;
}

function createReceipt() {
    receiptFormVisible = true;
    toggleVisibility("receiptForm", receiptFormVisible);
}

function submitReceipt() {
    var receiptId = document.getElementById("receiptId").value;
    var userName = document.getElementById("userName").value;
    var productId = document.getElementById("productId").value;
    var quantity = document.getElementById("quantity").value;
    var createdAt = new Date().toLocaleString();

    // Thêm phiếu nhập vào bảng tham chiếu
    receipts.push({
        id: receiptId,
        userName: userName,
        quantity: quantity,
        total: calculateTotal(quantity, productId), // Thay đổi ở đây
        createdAt: createdAt
    });

    // Thêm chi tiết phiếu nhập vào bảng tham chiếu
    var selectedProduct = products.find(p => p.id === productId);
    receiptDetails.push({
        id: receiptDetails.length + 1,
        idReceipt: receiptId,
        idProduct: productId,
        name: selectedProduct.name,
        idCategory: selectedProduct.idCategory,
        priceInput: selectedProduct.priceInput,
        priceOutput: calculatePriceOutput(selectedProduct.priceInput),
        quantity: quantity
    });

    // Cập nhật bảng tham chiếu
    updateReferenceTables();
}

function calculateTotal(quantity, productId) {
    var selectedProduct = products.find(p => p.id === productId);
    return quantity * selectedProduct.priceInput;
}

function updateReferenceTables() {
    viewReceipts();
    viewReceiptDetails();
}

function viewReceipts() {
    var receiptList = document.getElementById("receiptList");
    clearTable(receiptList);

    for (var i = 0; i < receipts.length; i++) {
        var row = receiptList.insertRow(-1);
        row.insertCell(0).innerHTML = receipts[i].id;
        row.insertCell(1).innerHTML = receipts[i].userName;
        row.insertCell(2).innerHTML = receipts[i].quantity;
        row.insertCell(3).innerHTML = receipts[i].total;
        row.insertCell(4).innerHTML = receipts[i].createdAt;
    }
}

function viewReceiptDetails() {
    var receiptDetailList = document.getElementById("receiptDetailList");
    clearTable(receiptDetailList);

    for (var i = 0; i < receiptDetails.length; i++) {
        var row = receiptDetailList.insertRow(-1);
        row.insertCell(0).innerHTML = receiptDetails[i].id;
        row.insertCell(1).innerHTML = receiptDetails[i].idReceipt;
        row.insertCell(2).innerHTML = receiptDetails[i].idProduct;
        row.insertCell(3).innerHTML = receiptDetails[i].name;
        row.insertCell(4).innerHTML = receiptDetails[i].idCategory;
        row.insertCell(5).innerHTML = receiptDetails[i].priceInput;
        row.insertCell(6).innerHTML = receiptDetails[i].priceOutput;
        row.insertCell(7).innerHTML = receiptDetails[i].quantity;
    }
}

function listItemsByDate() {
    var itemListByDateVisible = true;
    toggleVisibility("itemListByDate", itemListByDateVisible);

    if (itemListByDateVisible) {
        viewItemListByDate();
    }
}

function viewItemListByDate() {
    var itemListByDateTable = document.getElementById("itemListByDateTable");
    clearTable(itemListByDateTable);

    var itemQuantities = {};

    // Duyệt qua danh sách chi tiết phiếu nhập và tính tổng số lượng cho mỗi sản phẩm
    for (var i = 0; i < receiptDetails.length; i++) {
        var receiptDetail = receiptDetails[i];
        var createdAt = getReceiptCreatedAt(receiptDetail.idReceipt);

        if (!itemQuantities[receiptDetail.idProduct]) {
            itemQuantities[receiptDetail.idProduct] = {
                name: receiptDetail.name,
                quantity: 0
            };
        }

        itemQuantities[receiptDetail.idProduct].quantity += parseInt(receiptDetail.quantity);
    }

    // Hiển thị thông tin trong bảng
    for (var itemId in itemQuantities) {
        var item = itemQuantities[itemId];
        var row = itemListByDateTable.insertRow(-1);
        row.insertCell(0).innerHTML = itemId;
        row.insertCell(1).innerHTML = item.name;
        row.insertCell(2).innerHTML = item.quantity;
        row.insertCell(3).innerHTML = getCurrentDate(); // Sử dụng hàm getCurrentDate để lấy ngày hiện tại
    }
}

function getReceiptCreatedAt(receiptId) {
    var receipt = receipts.find(r => r.id === receiptId);
    return receipt ? receipt.createdAt : '';
}

function getCurrentDate() {
    var currentDate = new Date();
    return currentDate.toLocaleDateString();
}

function clearTable(table) {
    var rowCount = table.rows.length;
    // Sử dụng vòng lặp từ rowCount - 1 để 1 để xóa tất cả các dòng, không xóa dòng header
    for (var i = rowCount - 1; i >= 1; i--) {
        table.deleteRow(i);
    }
} 
//

// Liệt kê
function viewStock() {
var stockListVisible = true;
toggleVisibility("stockList", stockListVisible);
toggleVisibility("stockReceiptList", stockListVisible);

if (stockListVisible) {
    viewStockList();
    viewStockReceiptList();
}
}
    
function viewStockList() {
    var stockListTable = document.getElementById("stockList");
    clearTable(stockListTable);

    for (var i = 0; i < products.length; i++) {
        var row = stockListTable.insertRow(-1);
        row.insertCell(0).innerHTML = products[i].id;
        row.insertCell(1).innerHTML = products[i].name;
        row.insertCell(2).innerHTML = products[i].idCategory;
        row.insertCell(3).innerHTML = products[i].priceInput;
        row.insertCell(4).innerHTML = calculatePriceOutput(products[i].priceInput);
    }
}

function viewStockReceiptList() {
    var stockReceiptListTable = document.getElementById("stockReceiptList");
    clearTable(stockReceiptListTable);

    for (var i = 0; i < receipts.length; i++) {
        var row = stockReceiptListTable.insertRow(-1);
        row.insertCell(0).innerHTML = receipts[i].id;
        row.insertCell(1).innerHTML = receipts[i].userName;
        row.insertCell(2).innerHTML = calculateTotalQuantity(receipts[i].id);
        row.insertCell(3).innerHTML = calculateTotalPrice(receipts[i].id);
        row.insertCell(4).innerHTML = receipts[i].createdAt;
    }
}

function calculateTotalQuantity(receiptId) {
    var totalQuantity = 0;
    // Lặp qua từng chi tiết phiếu nhập
    for (var i = 0; i < receiptDetails.length; i++) {
        // Kiểm tra xem chi tiết phiếu nhập có thuộc về receiptId đã chỉ định không
        if (receiptDetails[i].idReceipt === receiptId) {
            // Cộng dồn số lượng cho chi tiết phiếu nhập tương ứng
            totalQuantity += parseInt(receiptDetails[i].quantity);
        }
    }
    // Trả về tổng số lượng cho receiptId đã chỉ định
    return totalQuantity;
}

function calculateTotalPrice(receiptId) {
    var totalPrice = 0;
    // Lặp qua từng chi tiết phiếu nhập
    for (var i = 0; i < receiptDetails.length; i++) {
        // Kiểm tra xem chi tiết phiếu nhập có thuộc về receiptId đã chỉ định không
        if (receiptDetails[i].idReceipt === receiptId) {
            totalPrice += parseInt(receiptDetails[i].quantity) * parseFloat(receiptDetails[i].priceInput);
        }
    }
    // Trả về giá tổng cộng cho receiptId đã chỉ định
    return totalPrice;
}
// xem mã nhập kho

function enterWarehouse() {
    var warehouseId = document.getElementById("warehouseId").value;

    // Kiểm tra xem có phiếu nhập kho có mã tương ứng hay không
    var warehouseExists = receipts.some(r => r.id === warehouseId);

    if (warehouseExists) {
        viewImportReceiptDetails(warehouseId);
    } else {
        alert("Không tìm thấy phiếu nhập kho với mã " + warehouseId);
    }
}

function viewImportReceiptDetails(warehouseId) {
    var warehouseDetailListTable = document.getElementById("warehouseDetailList");
    clearTable(warehouseDetailListTable);

    for (var i = 0; i < receiptDetails.length; i++) {
        if (receiptDetails[i].idReceipt === warehouseId) {
            var row = warehouseDetailListTable.insertRow(-1);
            row.insertCell(0).innerHTML = receiptDetails[i].idReceipt;
            row.insertCell(1).innerHTML = receiptDetails[i].idProduct;
            row.insertCell(2).innerHTML = receiptDetails[i].name;
            row.insertCell(3).innerHTML = receiptDetails[i].idCategory;
            row.insertCell(4).innerHTML = receiptDetails[i].priceInput;
            row.insertCell(5).innerHTML = receiptDetails[i].priceOutput;
            row.insertCell(6).innerHTML = receiptDetails[i].quantity;
            row.insertCell(7).innerHTML = getCurrentDate(); // Sử dụng hàm getCurrentDate để lấy ngày hiện tại
        }
    }
}
// Hàm cập nhật giá của sản phẩm
function updateProductPrices() {
    var updateProductId = document.getElementById("updateProductId").value;
    var updateProductPrice = document.getElementById("updateProductPrice").value;

    // Tìm sản phẩm cần cập nhật
    var updatedProduct = products.find(p => p.id == updateProductId);

    if (updatedProduct) {
        // Cập nhật giá nhập và tính lại giá bán
        updatedProduct.priceInput = parseFloat(updateProductPrice);
        updatedProduct.priceOutput = calculatePriceOutput(updatedProduct.priceInput);

        // Cập nhật bảng tham chiếu
        viewProductList();
    } else {
        alert("Không tìm thấy sản phẩm với ID " + updateProductId);
    }
}


