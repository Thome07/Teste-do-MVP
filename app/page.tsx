"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Heart, Menu, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, X } from "lucide-react";

type Product = { id: number; name: string; category: string; price: number; oldPrice?: number; color: string; image: string; badge?: string; description: string };
const products: Product[] = [
  { id: 1, name: "Camisa Aurora", category: "Roupas", price: 289, color: "Off-white", image: "photo-1598554747436-c9293d6a588f", badge: "Mais vendido", description: "Algodão orgânico · Caimento leve" },
  { id: 2, name: "Bolsa Nômade", category: "Acessórios", price: 429, color: "Caramelo", image: "photo-1584917865442-de89df76afd3", description: "Couro responsável · Feita à mão" },
  { id: 3, name: "Vestido Brisa", category: "Roupas", price: 398, oldPrice: 498, color: "Rosa argila", image: "photo-1595777457583-95e059d581b8", badge: "-20%", description: "Linho misto · Edição limitada" },
  { id: 4, name: "Óculos Sol", category: "Acessórios", price: 319, color: "Tartaruga", image: "photo-1511499767150-a48a237f0083", description: "Acetato reciclado · Proteção UV400" },
  { id: 5, name: "Calça Horizonte", category: "Roupas", price: 359, color: "Areia", image: "photo-1509631179647-0177331693ae", description: "Linho europeu · Cintura ajustável" },
  { id: 6, name: "Colar Raiz", category: "Acessórios", price: 189, color: "Dourado fosco", image: "photo-1611591437281-460bfbe1220a", badge: "Feito à mão", description: "Latão reciclado · Produção local" },
  { id: 7, name: "Tricot Sereno", category: "Roupas", price: 329, color: "Verde sálvia", image: "photo-1576566588028-4147f3842f27", description: "Algodão BCI · Toque macio" },
  { id: 8, name: "Tênis Caminho", category: "Calçados", price: 479, color: "Natural", image: "photo-1542291026-7eec264c27ff", description: "Materiais reaproveitados · Solado leve" },
];
const categories = ["Tudo", "Roupas", "Acessórios", "Calçados"];
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const imageUrl = (id: string, width = 700) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export default function Home() {
  const [category, setCategory] = useState("Tudo");
  const [sort, setSort] = useState("Destaques");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<{ id: number; quantity: number }[]>([]);
  const [added, setAdded] = useState<number | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("casa-alma-cart");
      const savedFavorites = localStorage.getItem("casa-alma-favorites");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch { /* Ignore invalid local browser data. */ }
  }, []);
  useEffect(() => { localStorage.setItem("casa-alma-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("casa-alma-favorites", JSON.stringify(favorites)); }, [favorites]);

  const visibleProducts = useMemo(() => {
    const found = products.filter((p) => (category === "Tudo" || p.category === category) && `${p.name} ${p.category} ${p.color}`.toLowerCase().includes(query.toLowerCase()));
    if (sort === "Menor preço") return [...found].sort((a, b) => a.price - b.price);
    if (sort === "Maior preço") return [...found].sort((a, b) => b.price - a.price);
    if (sort === "Novidades") return [...found].reverse();
    return found;
  }, [category, query, sort]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (products.find((p) => p.id === item.id)?.price ?? 0) * item.quantity, 0);
  const shipping = cartTotal >= 399 || cartTotal === 0 ? 0 : 19.9;

  function addToCart(id: number) {
    setCart((current) => current.some((item) => item.id === id) ? current.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { id, quantity: 1 }]);
    setAdded(id); window.setTimeout(() => setAdded(null), 1400);
  }
  function changeQuantity(id: number, delta: number) {
    setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  }
  function toggleFavorite(id: number) { setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  return <main>
    <div className="announcement"><span>FEITO COM CALMA, PRA DURAR</span><span className="announcement-right">Frete grátis acima de R$ 399 <span>·</span> 10% off na primeira compra</span></div>
    <header className="header">
      <button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={21}/></button>
      <nav className={`nav-left ${menuOpen ? "nav-open" : ""}`}><a href="#colecao" onClick={() => setMenuOpen(false)}>Novidades</a><a href="#colecao" onClick={() => {setCategory("Roupas"); setMenuOpen(false);}}>Roupas</a><a href="#colecao" onClick={() => {setCategory("Acessórios"); setMenuOpen(false);}}>Acessórios</a><a href="#sobre" onClick={() => setMenuOpen(false)}>Nossa história</a></nav>
      <a href="#topo" className="wordmark" id="topo">casa alma<span>®</span></a>
      <div className="nav-actions"><button className="icon-button search-action" aria-label="Buscar produtos" onClick={() => setSearchOpen(!searchOpen)}><Search size={19}/></button><button className="account-link" onClick={() => setCheckoutOpen(true)}>Minha conta</button><button className="bag-button" aria-label={`Sacola, ${cartCount} itens`} onClick={() => setCartOpen(true)}><ShoppingBag size={18}/><span>Sacola</span><span className="bag-count">{cartCount}</span></button></div>
    </header>
    {searchOpen && <div className="search-bar"><Search size={18}/><input autoFocus placeholder="O que você está procurando?" value={query} onChange={(e) => {setQuery(e.target.value); document.getElementById("colecao")?.scrollIntoView({behavior:"smooth"});}}/><button aria-label="Fechar busca" onClick={() => {setSearchOpen(false); setQuery("");}}><X size={18}/></button></div>}

    <section className="hero"><div className="hero-image"/><div className="hero-content"><span className="eyebrow"><Sparkles size={13}/> NOVA COLEÇÃO · VERÃO 25</span><h1>Vista o que<br/><em>faz sentido.</em></h1><p>Peças feitas com intenção, para viverem muitas histórias junto com você.</p><a href="#colecao" className="button button-dark">Descobrir coleção <ArrowRight size={16}/></a><div className="hero-note"><span className="hero-note-line"/> Natural por escolha. Essencial por natureza.</div></div><div className="hero-index">01 <span/> 04</div><div className="hero-side">SÃO PAULO · FEITO NO BRASIL</div></section>

    <section className="values-strip"><div><span className="value-mark">01</span><p>Produção em pequena escala</p></div><div><span className="value-mark">02</span><p>Materiais de origem responsável</p></div><div><span className="value-mark">03</span><p>Feito para durar — de verdade</p></div></section>

    <section className="collection section-wrap" id="colecao"><div className="section-heading"><div><span className="eyebrow">ESCOLHAS COM PROPÓSITO</span><h2>O essencial, <em>bem feito.</em></h2></div><a className="text-link" href="#sobre">Conheça nosso jeito <ArrowUpRight size={15}/></a></div>
      <div className="collection-controls"><div className="categories">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "category active" : "category"}>{item}</button>)}</div><label className="sort-label"><SlidersHorizontal size={15}/><select aria-label="Ordenar produtos" value={sort} onChange={(e) => setSort(e.target.value)}><option>Destaques</option><option>Novidades</option><option>Menor preço</option><option>Maior preço</option></select><ChevronDown size={14}/></label></div>
      {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id}><div className="product-image-wrap"><img src={imageUrl(product.image)} alt={product.name}/>{product.badge && <span className="product-badge">{product.badge}</span>}<button aria-label={favorites.includes(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"} className={`favorite ${favorites.includes(product.id) ? "favorited" : ""}`} onClick={() => toggleFavorite(product.id)}><Heart size={17} fill={favorites.includes(product.id) ? "currentColor" : "none"}/></button><button className="quick-add" onClick={() => addToCart(product.id)}>{added === product.id ? <><Check size={15}/> Adicionado</> : <><Plus size={15}/> Adicionar à sacola</>}</button></div><div className="product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><div className="product-price">{product.oldPrice && <del>{money(product.oldPrice)}</del>}<span>{money(product.price)}</span></div></div><div className="product-color"><i style={{background: product.color === "Off-white" ? "#e8e3d9" : product.color === "Caramelo" ? "#b97849" : product.color === "Verde sálvia" ? "#a1a78d" : product.color === "Rosa argila" ? "#bd8e81" : product.color === "Tartaruga" ? "#594538" : product.color === "Dourado fosco" ? "#c7a365" : "#c3b59d"}}/> {product.color}</div></article>)}</div> : <div className="empty-results">Nenhuma peça encontrada. Tente outra busca.</div>}
      <div className="all-products"><span>{visibleProducts.length} peças para escolher com calma</span><button onClick={() => {setCategory("Tudo"); setQuery("");}}>Ver coleção completa <ArrowDown size={15}/></button></div>
    </section>

    <section className="editorial" id="sobre"><div className="editorial-image"><img src={imageUrl("photo-1483985988355-763728e1935b", 1100)} alt="Look da coleção CASA ALMA"/><span className="image-caption">COLEÇÃO VERÃO 25 — 001</span></div><div className="editorial-copy"><span className="eyebrow">MENOS, COM MAIS INTENÇÃO</span><h2>Não é sobre ter mais.<br/><em>É sobre sentir mais.</em></h2><p>Acreditamos que o que vestimos pode carregar os nossos valores. Por isso, criamos menos peças, em melhores materiais, com gente que respeita cada etapa.</p><a href="#colecao" className="text-link">Um pouco da nossa história <ArrowUpRight size={15}/></a><div className="editorial-seal"><span>CA</span><small>FEITO COM<br/>INTENÇÃO</small></div></div></section>

    <section className="newsletter"><div className="newsletter-spark"><Sparkles size={18}/></div><span className="eyebrow">CARTA DA CASA</span><h2>Um respiro na sua caixa de entrada.</h2><p>Novidades, histórias e um carinho de 10% na primeira compra.</p>{subscribed ? <div className="success-message"><Check size={18}/> Pronto! Sua carta está a caminho.</div> : <form onSubmit={(e) => {e.preventDefault(); if(email.includes("@")) setSubscribed(true);}}><input type="email" required placeholder="Seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)}/><button type="submit">Quero receber <ArrowRight size={16}/></button></form>}<small>Sem excesso. Cancele quando quiser.</small></section>

    <footer className="footer"><div className="footer-main"><div className="footer-brand"><a className="wordmark" href="#topo">casa alma<span>®</span></a><p>Vista o que faz sentido.<br/>Feito com calma, em São Paulo.</p><div className="social-links"><a href="#instagram">Instagram</a><a href="#pinterest">Pinterest</a></div></div><div><span className="footer-title">AJUDA</span><a href="#entrega">Entregas e trocas</a><a href="#tamanho">Guia de tamanhos</a><a href="#faq">Dúvidas frequentes</a><a href="#contato">Fale com a gente</a></div><div><span className="footer-title">A CASA</span><a href="#sobre">Nossa história</a><a href="#materiais">Nossos materiais</a><a href="#sustentabilidade">Compromissos</a><a href="#trabalhe">Trabalhe conosco</a></div><div><span className="footer-title">ATENDIMENTO</span><p>Seg a sex, das 9h às 18h</p><a href="mailto:oi@casaalma.com.br">oi@casaalma.com.br</a><a href="#whatsapp">WhatsApp: (11) 99999-0000</a></div></div><div className="footer-bottom"><span>© 2025 CASA ALMA · CNPJ 00.000.000/0001-00</span><span>Feito com intenção no Brasil <span className="footer-heart">♥</span></span><div className="payments"><span>PIX</span><span>VISA</span><span>mastercard</span></div></div></footer>

    {cartOpen && <div className="overlay" onMouseDown={(e) => {if(e.target === e.currentTarget) setCartOpen(false);}}><aside className="drawer"><div className="drawer-header"><div><span className="eyebrow">SUA ESCOLHA</span><h2>Sacola <span>({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Fechar sacola"><X size={20}/></button></div>{cart.length ? <><div className="shipping-progress"><p>{cartTotal >= 399 ? "Você ganhou frete grátis!" : `Faltam ${money(399 - cartTotal)} para o frete grátis`}</p><div><i style={{width:`${Math.min(100,cartTotal/399*100)}%`}}/></div></div><div className="cart-items">{cart.map((item) => {const product = products.find((p) => p.id === item.id)!;return <div className="cart-item" key={item.id}><img src={imageUrl(product.image,220)} alt=""/><div className="cart-item-info"><h3>{product.name}</h3><p>{product.color}</p><strong>{money(product.price)}</strong><div className="quantity-control"><button aria-label="Diminuir quantidade" onClick={() => changeQuantity(item.id,-1)}><Minus size={13}/></button><span>{item.quantity}</span><button aria-label="Aumentar quantidade" onClick={() => changeQuantity(item.id,1)}><Plus size={13}/></button></div></div><button className="remove-item" aria-label="Remover produto" onClick={() => setCart((current) => current.filter((line) => line.id !== item.id))}><X size={15}/></button></div>})}</div><div className="drawer-footer"><div className="subtotal-line"><span>Subtotal</span><span>{money(cartTotal)}</span></div><div className="subtotal-line shipping-line"><span>Entrega</span><span>{shipping === 0 ? "Grátis" : money(shipping)}</span></div><div className="subtotal-line total-line"><span>Total</span><strong>{money(cartTotal+shipping)}</strong></div><button className="button button-dark checkout-button" onClick={() => {setCartOpen(false);setCheckoutOpen(true);}}>Continuar para entrega <ArrowRight size={16}/></button><p className="secure-note">Checkout seguro · Pagamento demonstrativo</p></div></> : <div className="empty-cart"><div className="empty-bag"><ShoppingBag size={25}/></div><h3>Sua sacola está esperando.</h3><p>Encontre algo que faça sentido para você.</p><button className="button button-dark" onClick={() => setCartOpen(false)}>Explorar peças <ArrowRight size={16}/></button></div>}</aside></div>}

    {checkoutOpen && <div className="overlay" onMouseDown={(e) => {if(e.target === e.currentTarget) {setCheckoutOpen(false);setOrderPlaced(false);}}}><section className="checkout-modal"><div className="modal-heading"><div><span className="eyebrow">CASA ALMA · FINALIZAÇÃO</span><h2>{orderPlaced ? "Pedido recebido." : "Quase seu."}</h2></div><button className="icon-button" onClick={() => {setCheckoutOpen(false);setOrderPlaced(false);}} aria-label="Fechar"><X size={20}/></button></div>{orderPlaced ? <div className="order-success"><div><Check size={28}/></div><p>Seu pedido <strong>#CA-2025-01842</strong> foi registrado.</p><span>Este é um checkout demonstrativo. Nenhuma cobrança foi realizada.</span><button className="button button-dark" onClick={() => {setCheckoutOpen(false);setOrderPlaced(false);setCart([]);}}>Voltar à loja <ArrowRight size={16}/></button></div> : <><div className="checkout-steps"><span className="step-current"><i>1</i> Entrega</span><span className="step-line"/><span><i>2</i> Pagamento</span><span className="step-line"/><span><i>3</i> Revisão</span></div>{cart.length === 0 && <div className="checkout-empty-note">Entre na sua conta ou adicione peças à sacola para continuar.</div>}<form className="checkout-form" onSubmit={(e) => {e.preventDefault(); setOrderPlaced(true);}}><h3>Seus dados</h3><div className="form-row"><label>Nome completo<input required placeholder="Como podemos te chamar?"/></label><label>E-mail<input type="email" required placeholder="voce@email.com"/></label></div><h3>Endereço de entrega</h3><div className="form-row"><label>CEP<input required placeholder="00000-000" maxLength={9}/></label><label>Celular<input required type="tel" placeholder="(00) 00000-0000"/></label></div><label>Endereço<input required placeholder="Rua, avenida..."/></label><div className="form-row"><label>Número<input required placeholder="Nº"/></label><label>Complemento <span className="optional">opcional</span><input placeholder="Apto, bloco, casa"/></label></div><div className="demo-payment"><span className="demo-icon"><Check size={16}/></span><div><strong>Pagamento de demonstração</strong><p>Sem cobrança real. Use este fluxo para visualizar a experiência de compra.</p></div></div><button className="button button-dark checkout-submit" type="submit" disabled={cart.length === 0}>Confirmar pedido · {money(cartTotal+shipping)} <ArrowRight size={16}/></button><p className="secure-note">Seus dados estão protegidos e não são armazenados.</p></form></>}</section></div>}
    <button className={`floating-cart ${cartCount ? "floating-visible" : ""}`} onClick={() => setCartOpen(true)} aria-label={`Abrir sacola, ${cartCount} itens`}><ShoppingBag size={18}/><span>{cartCount}</span></button>
  </main>;
}
