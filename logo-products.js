'use strict';
const logoShirtColors=[
  {name:'Preto',slug:'preto',hex:'#202020',ink:'#f4efdf'},
  {name:'Branco',slug:'branco',hex:'#faf9f6',ink:'#061338'},
  {name:'Azul marinho',slug:'azul-marinho',hex:'#102747',ink:'#f4efdf'}
];
const logoOverColors=[logoShirtColors[1],logoShirtColors[0],{name:'Marrom',slug:'marrom',hex:'#654632',ink:'#f4efdf'},{name:'Off-white',slug:'off-white',hex:'#eae3d3',ink:'#061338'}];
function logoProductPath(product,index,side='frente'){
  return product.imageFolder+'/'+product.shirtDesign+'-'+product.variants[index].slug+'-'+side+'.png?v=logo-vaz-novos-1';
}
const logoProducts={
  overVaz:{title:'OVER VAZ',description:'Modelagem Over, com a logo VAZ pequena e centralizada na frente. Costas lisas, sem estampa.',shirtDesign:'logo-over',imageFolder:'Camisas/Mockups/logo-over',logoOnly:true,defaultSide:'frente',variants:logoOverColors},
  camisaVaz:{title:'Camisa VAZ',description:'Camisa de modelagem normal, com a logo VAZ pequena e centralizada na frente. Costas lisas, sem estampa.',shirtDesign:'logo-normal',imageFolder:'Camisas/Mockups/logo-normal',logoOnly:true,defaultSide:'frente',variants:logoShirtColors},
  capuzVaz:{title:'Moletom com capuz VAZ',description:'Moletom com capuz, com a logo VAZ pequena e centralizada na frente. Costas lisas, sem estampa.',shirtDesign:'capuz-logo',imageFolder:'Moletons/Mockups/capuz-logo',sweatshirt:true,logoOnly:true,defaultSide:'frente',variants:sweatshirtColors},
  boneVaz:{title:'Boné VAZ',description:'Apenas a logo principal VAZ pequena e centralizada na frente, com contraste adaptado à cor do boné.',logoOnly:true,variants:[
    {name:'Preto',slug:'preto',hex:'#202020',ink:'#f4efdf'},
    {name:'Branco',slug:'branco',hex:'#faf9f6',ink:'#061338'},
    {name:'Azul',slug:'azul',hex:'#2349dc',ink:'#f4efdf'},
    {name:'Marrom',slug:'marrom',hex:'#59372b',ink:'#f4efdf'},
    {name:'Verde',slug:'verde',hex:'#254737',ink:'#f4efdf'}
  ].map(c=>({...c,image:'Bonés/Mockups/sem-fundo/'+c.slug+'-00-logo-vaz.png?v=bordado-2',status:c.name+' · VAZ'}))}
};
