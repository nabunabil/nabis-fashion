function ProductCard({ name, price, image }) {
    return (
        <div className="product-card">
            <img src={image} alt={name} className="product-image" />

            <span className="product-category">Fashion</span>

            <h3>{name}</h3>

            <div className="rating">★★★★★</div>

            <p className="price">{price}</p>

            <button className="btn">Add To Cart</button>
        </div>
    );
}

export default ProductCard;