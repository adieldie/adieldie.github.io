export function runSample(product, stock, quantity, lowStockAlert) {
 const catalog = { caderno: {name:'Caderno',price:18}, caneta:{name:'Caneta',price:4.5}, pasta:{name:'Pasta',price:12} };
 if (!Object.hasOwn(catalog,product) || !Number.isInteger(stock) || !Number.isInteger(quantity) || stock<0 || stock>999 || quantity<1 || quantity>999) return {ok:false,valid:false,title:'Confira os valores',message:'Use um produto da lista, estoque entre 0 e 999 e quantidade inteira entre 1 e 999.'};
 if(quantity>stock) return {ok:false,valid:true,title:'Pedido bloqueado pela regra',message:`O pedido tem ${quantity} unidades, mas há somente ${stock} disponíveis. Ajuste a quantidade ou o estoque e tente novamente.`};
 const remaining=stock-quantity;
 return {ok:true,valid:true,title:'Pedido de exemplo processado',message:`${quantity} × ${catalog[product].name}. A regra permitiu o processamento.`,remaining,total:quantity*catalog[product].price,alert:!!lowStockAlert&&remaining<5};
}
