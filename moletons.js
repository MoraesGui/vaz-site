'use strict';
const sweatshirtColors=[
  {
    "name": "Preto",
    "slug": "preto",
    "hex": "#252529",
    "ink": "#f4efdf"
  },
  {
    "name": "Branco",
    "slug": "branco",
    "hex": "#faf9f6",
    "ink": "#061338"
  },
  {
    "name": "Cinza",
    "slug": "cinza",
    "hex": "#a4a5a8",
    "ink": "#061338"
  },
  {
    "name": "Azul marinho",
    "slug": "azul-marinho",
    "hex": "#192b4d",
    "ink": "#f4efdf"
  },
  {
    "name": "Off-white",
    "slug": "off-white",
    "hex": "#eae3d3",
    "ink": "#061338"
  }
];
const sweatshirtProducts={moletom:{title:'Moletom VAZ sem capuz',description:'A assinatura principal VAZ em cinco cores de tecido, com contraste adaptado a cada cor.',shirtDesign:'sem-capuz',sweatshirt:true,defaultSide:'frente',singleSide:true,variants:sweatshirtColors.map(c=>({...c,image:'Moletons/Mockups/sem-capuz/sem-capuz-'+c.slug+'-frente.png?v=sem-capuz-logo-8',status:c.name+' · Logo VAZ'}))},moletomCapuz:{title:'Moletom Para Sempre Boas Novas com capuz',description:'VAZ * GOOD NEWS na frente e a arte Para Sempre Boas Novas nas costas. Escolha sua cor e explore os dois lados.',shirtDesign:'capuz',sweatshirt:true,defaultSide:'frente',variants:sweatshirtColors.map(c=>({...c,image:'Moletons/Mockups/capuz/capuz-'+c.slug+'-frente.png?v=capuz-good-news-7',status:c.name+' · Frente'}))}};
function sweatshirtPath(product,index,side='frente'){if(product.logoOnly)return logoProductPath(product,index,side);if(product.singleSide)side='frente';return 'Moletons/Mockups/'+product.shirtDesign+'/'+product.shirtDesign+'-'+product.variants[index].slug+'-'+side+'.png?v='+(product.shirtDesign==='capuz'&&side==='frente'?'capuz-good-news-7':product.shirtDesign==='sem-capuz'?'sem-capuz-logo-8':'roupas-gola-1');}
