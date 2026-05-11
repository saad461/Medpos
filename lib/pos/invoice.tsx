import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Sale, SaleItem, StoreSettings } from '@/types';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  totals: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 8,
    color: 'grey',
  },
});

export const InvoicePDF = ({ sale, settings, items }: { sale: Sale, settings: StoreSettings, items: SaleItem[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.storeName}>{settings.tenant_id} Pharmacy</Text>
        <Text>{settings.address}</Text>
        <Text>Phone: {settings.phone}</Text>
      </View>

      <View style={styles.invoiceInfo}>
        <View>
          <Text>Invoice No: {sale.invoice_no}</Text>
          <Text>Date: {format(new Date(sale.created_at), 'MMM d, yyyy h:mm a')}</Text>
        </View>
        <View>
          <Text>Customer: {sale.customer_id || 'Walk-in'}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableColHeader, { width: '40%' }]}>Medicine</Text>
          <Text style={styles.tableColHeader}>Qty</Text>
          <Text style={styles.tableColHeader}>Price</Text>
          <Text style={styles.tableColHeader}>Total</Text>
        </View>
        {items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCol, { width: '40%' }]}>{item.medicine_name}</Text>
            <Text style={styles.tableCol}>{item.qty}</Text>
            <Text style={styles.tableCol}>{item.unit_price}</Text>
            <Text style={styles.tableCol}>{item.subtotal}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <Text>Subtotal: Rs. {sale.subtotal}</Text>
        <Text>Discount: Rs. {sale.discount}</Text>
        <Text>Tax: Rs. {sale.tax}</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Total: Rs. {sale.total}</Text>
      </View>

      <View style={styles.footer}>
        <Text>{settings.receipt_footer}</Text>
        <Text>Powered by MedPOS</Text>
      </View>
    </Page>
  </Document>
);
