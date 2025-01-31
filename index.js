const express = require('express');
const axios = require('axios');
const os = require('os');
const app = express();
const fs = require('fs');
const path = require('path');



app.use(express.json());

// Yang pertama itu kita looop dari 1 - 1000 sebagai elemen array
let availableCodes = Array.from({ length: 1000 }, (_, i) => i + 1); // 1 - 1000
let usedCodes = {};
const PORT = 3000;
const invoices = {}; // Menyimpan data invoice

// Endpoint untuk membuat invoice
/*
app.post('/api/buatinvoice', (req, res) => {
    const merchant_code = req.body.merchant_code;
    const api_key       = req.body.api_key;
    const callback_url  = req.body.callback_url;
    const amount        = req.body.amount;
    const interval      = req.body.interval;
    if (!merchant_code || !api_key || !callback_url || !amount || !interval) {
        return res.status(400).json({ ok : false, error: 'Parameter tidak valid kak' });
    }

    if (availableCodes.length === 0) {
        return res.status(400).json({ ok : false, error: 'Kode unik saat ini sedang tidak tersedia, mohon coba kembali nanti.' });
    }

    const uniqueCode = availableCodes.shift(); // Kita ambil yang pertama
    const invoiceAmount = amount + uniqueCode;
    const invoiceId = `INV-${Date.now()}-${uniqueCode}`;

    usedCodes[uniqueCode] = true;
    invoices[invoiceId] = { merchant_code, api_key, callback_url, amount, uniqueCode, invoiceAmount, interval, createdAt: Date.now() };
    console.log(`Invoice baru : ${invoiceId} jumlah ${invoiceAmount}`);
    res.json({ ok : true, invoice_id: invoiceId, amount: invoiceAmount });
});
*/


app.post('/api/buatinvoice', async (req, res) => {
    const { merchant_code, api_key, callback_url, amount, interval } = req.body;

    if (!merchant_code || !api_key || !callback_url || !amount || !interval) {
        return res.status(400).json({ ok: false, error: 'Parameter tidak valid kak' });
    }

    if (availableCodes.length === 0) {
        return res.status(400).json({ ok: false, error: 'Kode unik tidak tersedia, coba lagi nanti.' });
    }

    const uniqueCode = availableCodes.shift();
    const invoiceAmount = amount + uniqueCode;
    const invoiceId = `INV-${Date.now()}-${uniqueCode}`;

    invoices[invoiceId] = {
        merchant_code,
        api_key,
        callback_url,
        amount,
        uniqueCode,
        invoiceAmount,
        interval,
        createdAt: Date.now() 
    };

    console.log(`Invoice baru: ${invoiceId}, jumlah: ${invoiceAmount}`);
    res.json({ ok: true, invoice_id: invoiceId, amount: invoiceAmount, unique : uniqueCode });
});








app.post('/api/callback', (req, res) => {
    const timestamp = new Date().toISOString()
        .replace(/T/, '-')
        .replace(/:/g, '-')
        .replace(/\..+/, '');
    const fileName = `LOG-${timestamp}.json`;
    const folderPath = path.join(__dirname, 'callback-log');
    // Buat folder jika tidak ada...
    if (!fs.existsSync(folderPath)) { fs.mkdirSync(folderPath); }

    // Menentukan path file
    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    console.log(`Log internal berhasil di simpan ${fileName}`);
    res.status(200).send({ message: 'Berhasil menyimpan log!', file: fileName });
});




setInterval(async () => {
    const now = Date.now();
    if (Object.keys(invoices).length === 0) return;

    const sampleInvoice = Object.values(invoices)[0];
    const { merchant_code, api_key } = sampleInvoice;
    const urlParam = `https://gateway.okeconnect.com/api/mutasi/qris/${merchant_code}/${api_key}`;
    
    try {
        const response = await axios.get(urlParam);
        const mutasiBaru = response.data.data || [];
        console.log(`mengammbil mutasi untuk }`);
        for (const [invoiceId, invoice] of Object.entries(invoices)) {
            const { callback_url, uniqueCode, invoiceAmount, interval, createdAt } = invoice;

            // Filter hanya transaksi yang tanggalnya lebih besar dari createdAt
            const transaksiValid = mutasiBaru.filter(item => {
                return parseInt(item.amount) === invoiceAmount && 
                    new Date(item.date).getTime() > createdAt;
            });

            // Cek apakah ada transaksi yang cocok
            if (transaksiValid.length > 0) {
                console.log(`✅ Invoice PAID: ${invoiceId}, jumlah: ${invoiceAmount}`);
                await axios.post(callback_url, { invoice_id: invoiceId, status: 'PAID', data: transaksiValid[0] });
                delete invoices[invoiceId];
                availableCodes.push(uniqueCode);
            } else if (now > createdAt + interval * 1000) {
                console.log(`❌ Invoice EXPIRED: ${invoiceId}, jumlah: ${invoiceAmount}`);
                await axios.post(callback_url, { invoice_id: invoiceId, status: 'EXPIRED' });
                delete invoices[invoiceId];
                availableCodes.push(uniqueCode);
                //console.log(`KODE TERSEDIA : ${availableCodes} `);
            }
        }
    } catch (error) {
        console.error(`Gagal Ambil Mutasi:`, error.message);
    }
}, 20000);







function getLocalAndNetworkIPs() {
    const interfaces = os.networkInterfaces();
    const ips = { local: '127.0.0.1', network: null };
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.network = iface.address;
            }
        }
    }
    return ips;
}

const { local, network } = getLocalAndNetworkIPs();
app.listen(PORT, () => {
    console.log(`Berhasil menjalankan SERVER:`);
    console.log(`- LOKAL: http://${local}:${PORT}`);
    if (network) {
        console.log(`- JARINGAN: http://${network}:${PORT}`);
    } else {
        console.log(`- JARINGAN: Tidak terhubung dengan jaringan!`);
    }
});