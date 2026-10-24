import { ProduceRecord, ExpenseRecord, IncomeRecord } from '../types';

export function exportRecordsToCSV(
  farmerName: string,
  produce: ProduceRecord[],
  expenses: ExpenseRecord[],
  income: IncomeRecord[]
) {
  let csvContent = 'data:text/csv;charset=utf-8,';

  // Section 1: Farmer Header
  csvContent += `KISSAN CONNECT - FARM RECORDS EXPORT\r\n`;
  csvContent += `Farmer Name,${farmerName}\r\n`;
  csvContent += `Export Date,${new Date().toLocaleDateString()}\r\n\r\n`;

  // Section 2: Produce Records
  csvContent += `PRODUCE HARVEST RECORDS\r\n`;
  csvContent += `Date,Crop,Season,Land Area,Quantity,Unit,Quality Grade,Storage Location,Notes\r\n`;
  produce.forEach((p) => {
    csvContent += `"${p.date}","${p.crop}","${p.season}","${p.landArea}","${p.quantity}","${p.unit}","${p.quality}","${p.storageLocation}","${p.notes || ''}"\r\n`;
  });
  csvContent += `\r\n`;

  // Section 3: Income Records
  csvContent += `INCOME & SALES RECORDS\r\n`;
  csvContent += `Date,Crop,Buyer,Quantity Sold,Unit,Rate per Unit (PKR),Total Amount (PKR),Notes\r\n`;
  income.forEach((inc) => {
    csvContent += `"${inc.date}","${inc.crop}","${inc.buyer}","${inc.quantitySold}","${inc.unit}","${inc.ratePerUnit}","${inc.totalAmount}","${inc.notes || ''}"\r\n`;
  });
  csvContent += `\r\n`;

  // Section 4: Expense Records
  csvContent += `EXPENSE RECORDS\r\n`;
  csvContent += `Date,Crop,Category,Amount (PKR),Notes\r\n`;
  expenses.forEach((e) => {
    csvContent += `"${e.date}","${e.crop}","${e.category}","${e.amount}","${e.notes || ''}"\r\n`;
  });
  csvContent += `\r\n`;

  // Summary
  const totalIncome = income.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpense;

  csvContent += `FINANCIAL SUMMARY\r\n`;
  csvContent += `Total Sales / Income (PKR),${totalIncome}\r\n`;
  csvContent += `Total Expenses (PKR),${totalExpense}\r\n`;
  csvContent += `Net Farm Profit / Loss (PKR),${netProfit}\r\n`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `kissan_records_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printFarmReport(
  farmerName: string,
  produce: ProduceRecord[],
  expenses: ExpenseRecord[],
  income: IncomeRecord[]
) {
  const totalIncome = income.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Kissan Connect - Farm Report (${farmerName})</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 30px; color: #1b1b1b; }
          h1 { color: #1B5E20; margin-bottom: 4px; }
          .header { border-bottom: 2px solid #2E7D32; padding-bottom: 12px; margin-bottom: 24px; }
          .meta { font-size: 14px; color: #555; }
          .summary-box { display: flex; gap: 20px; margin: 20px 0; }
          .stat { border: 1px solid #ddd; padding: 12px 18px; border-radius: 8px; flex: 1; }
          .stat h4 { margin: 0 0 6px; font-size: 13px; color: #666; }
          .stat p { margin: 0; font-size: 20px; font-weight: bold; }
          .profit { color: #1B5E20; }
          .loss { color: #c62828; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
          th, td { border: 1px solid #e0e0e0; padding: 8px 10px; text-align: left; }
          th { background-color: #f1f8e9; color: #1B5E20; }
          h3 { color: #2E7D32; margin-top: 24px; border-left: 4px solid #2E7D32; padding-left: 8px; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Kissan Connect (کسان کنیکٹ)</h1>
          <div class="meta">
            <strong>Farmer:</strong> ${farmerName} | 
            <strong>Date Generated:</strong> ${new Date().toLocaleDateString('en-PK')}
          </div>
        </div>

        <div class="summary-box">
          <div class="stat">
            <h4>Total Revenue</h4>
            <p>PKR ${totalIncome.toLocaleString()}</p>
          </div>
          <div class="stat">
            <h4>Total Expenses</h4>
            <p>PKR ${totalExpense.toLocaleString()}</p>
          </div>
          <div class="stat">
            <h4>Net Profit / (Loss)</h4>
            <p class="${netProfit >= 0 ? 'profit' : 'loss'}">PKR ${netProfit.toLocaleString()}</p>
          </div>
        </div>

        <h3>Produce Harvest Records</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Crop</th><th>Season</th><th>Area</th><th>Qty</th><th>Quality</th><th>Storage Location</th>
            </tr>
          </thead>
          <tbody>
            ${produce.map(p => `
              <tr>
                <td>${p.date}</td><td>${p.crop}</td><td>${p.season}</td><td>${p.landArea}</td><td>${p.quantity} ${p.unit}</td><td>${p.quality}</td><td>${p.storageLocation}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Income & Produce Sales</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Crop</th><th>Buyer</th><th>Qty Sold</th><th>Rate/Unit</th><th>Total (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${income.map(i => `
              <tr>
                <td>${i.date}</td><td>${i.crop}</td><td>${i.buyer}</td><td>${i.quantitySold} ${i.unit}</td><td>PKR ${i.ratePerUnit.toLocaleString()}</td><td>PKR ${i.totalAmount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Farm Operational Expenses</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Crop</th><th>Expense Category</th><th>Amount (PKR)</th><th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
              <tr>
                <td>${e.date}</td><td>${e.crop}</td><td style="text-transform: capitalize;">${e.category}</td><td>PKR ${e.amount.toLocaleString()}</td><td>${e.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          Generated via Kissan Connect - Pakistan's Digital Agriculture Platform
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}
