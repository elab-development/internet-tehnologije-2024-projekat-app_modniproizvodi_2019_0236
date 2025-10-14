import React from 'react';
import './HomePage.css';

function HomePage() {
  
  return (
    <div className="homepage">
      <header className="hero-section">
        <h1>Dobrodošli u Modnu Oazu</h1>
        <p>Otkrijte najnovije modne trendove i inspiracije</p>
        <button className="shop-now-btn">Kupujte Sada</button>
      </header>

      <section className="featured-collections">
        <h2>Istaknute Kolekcije</h2>
        <div className="collections-grid">
          <div className="collection-item">
            <img src="https://i.pinimg.com/736x/63/36/c4/6336c495e2e358ae702c24dce5751510.jpg" alt="Proljetna Kolekcija" />
            <h3>Prolećna kolekcija</h3>
          </div>
          <div className="collection-item">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROtKlL-RpP_VmVI8X5jhTqXhNnsiq2nl-YtwX89ee2b917EiLCpwkbWqz2JKfLFFtEXrY&usqp=CAU" alt="Ljetna Kolekcija" />
            <h3>Letnja kolekcija</h3>
          </div>
          <div className="collection-item">
            <img src="https://i.pinimg.com/736x/ca/b7/ec/cab7ec0c4809f50674ad5c92cace11bd.jpg" alt="Jesenska Kolekcija" />
            <h3>Jesenja kolekcija</h3>
          </div>
        </div>
      </section>

      <section className="newsletter-signup">
        <h2>Pretplatite se na Newsletter</h2>
        <p>Budite prvi koji će saznati za nove kolekcije i popuste</p>
        <form>
          <input type="email" placeholder="Vaša email adresa" />
          <button type="submit">Pretplati se</button>
        </form>
      </section>

      <footer className="footer">
        <p>&copy; 2023 Modna Oaza. Sva prava zadržana.</p>
        <p>Developer by wildroses12 & teodoram3</p>

      </footer>
    </div>
  );
}

export default HomePage;
