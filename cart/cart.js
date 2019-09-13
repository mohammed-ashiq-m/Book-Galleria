module.exports.cartAdd=function (oldCart,product,id)
{
    newCart=oldCart;
    let storedItem=newCart.items[id]
    if(!storedItem)
    {
        storedItem=newCart.items[id]={item:product,Qty:0,price:0}
    }
    console.log(storedItem)
    storedItem.Qty++;
    storedItem.price=product.price * storedItem.Qty;
    console.log(storedItem.price)
    newCart.items[id]=storedItem
    newCart.totalQty++;
    newCart.totalPrice+=storedItem.price/storedItem.Qty;
    console.log(newCart)

    return newCart;

}
module.exports.generateArray=function(cart){
    let arr=[];
    for(let id in cart.items)
    {
        arr.push(cart.items[id])
    }
    return arr;
}
module.exports.reduceOne=function(cart,productId){
    cart.items[productId].Qty--;
    cart.items[productId].price-=cart.items[productId].item.price;
    cart.totalQty--;
    cart.totalPrice-=cart.items[productId].item.price;
    if(cart.items[productId].Qty<=0)
        delete cart.items[productId]
    return cart
}
module.exports.removeall=function(cart,productId){
    cart.totalQty -= cart.items[productId].Qty;
    cart.totalPrice -= cart.items[productId].price;
    delete cart.items[productId];
    return cart;
}