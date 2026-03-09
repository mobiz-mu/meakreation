export function orderPlacedHtml(p: {
  orderNo: string;
  totalMur: number;
  paymentMethod: "COD" | "SPARK";
}) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Merci ! Votre commande ${p.orderNo} est reçue ✅</h2>
    <p>Total: <b>Rs ${p.totalMur}</b></p>
    <p>Moyen de paiement: <b>${p.paymentMethod}</b></p>
    <p>Nous vous contacterons bientôt pour la livraison.</p>
    <hr/>
    <p style="color:#666;font-size:12px">Mea Kréation</p>
  </div>`;
}

export function paymentConfirmedHtml(p: {
  orderNo: string;
  totalMur: number;
}) {
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.5">
    <h2>Paiement confirmé ✅</h2>
    <p>Commande: <b>${p.orderNo}</b></p>
    <p>Total payé: <b>Rs ${p.totalMur}</b></p>
    <p>Merci pour votre achat 💛</p>
    <hr/>
    <p style="color:#666;font-size:12px">Mea Kréation</p>
  </div>`;
}