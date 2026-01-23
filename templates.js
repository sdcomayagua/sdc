// templates.js
(() => {
  function mount() {
    const host = document.getElementById("templatesMount");
    if (!host) return;
    if (document.getElementById("productModal")) return;

    host.innerHTML = `
<div class="modal" id="thanksModal" aria-hidden="true">
  <div class="sheet">
    <div class="head row" style="justify-content:space-between">
      <div style="font-weight:1000">Listo</div>
      <button class="btn" id="thanksClose" type="button">Cerrar</button>
    </div>
    <div class="body">
      <div class="thanksBox">
        <div class="thanksTitle">Gracias por tu pedido ✅</div>
        <div class="thanksText">Te contactaremos pronto para confirmar disponibilidad y envío.</div>
        <label class="note" style="display:flex;gap:10px;align-items:center;margin-top:10px;justify-content:center">
          <input type="checkbox" id="clearAfterSend">
          Limpiar carrito después de enviar
        </label>
        <button class="btn acc" id="thanksContinue" type="button" style="margin-top:12px;width:100%">Seguir comprando</button>
      </div>
    </div>
  </div>
</div>

<div class="modal" id="sortModal" aria-hidden="true">
  <div class="sheet">
    <div class="head row" style="justify-content:space-between">
      <div style="font-weight:1000">Ordenar</div>
      <button class="btn" id="sortClose" type="button">Cerrar</button>
    </div>
    <div class="body">
      <div class="panel" style="padding:12px">
        <button class="btn ghost sortItem" data-sort="relevancia" type="button">Relevancia</button>
        <button class="btn ghost sortItem" data-sort="stock_first" type="button">Disponibles primero</button>
        <button class="btn ghost sortItem" data-sort="precio_asc" type="button">Precio menor</button>
        <button class="btn ghost sortItem" data-sort="precio_desc" type="button">Precio mayor</button>
        <button class="btn ghost sortItem" data-sort="orden_desc" type="button">Más nuevos</button>
      </div>
    </div>
  </div>
</div>

<div class="modal" id="zoomModal" aria-hidden="true">
  <div class="sheet zoomSheet">
    <div class="head row" style="justify-content:space-between">
      <div style="font-weight:1000">Zoom</div>
      <button class="btn" id="zoomClose" type="button">Cerrar</button>
    </div>
    <div class="body">
      <img id="zoomImg" class="zoomImg" alt="zoom">
    </div>
  </div>
</div>

<div class="modal" id="productModal" aria-hidden="true">
  <div class="sheet">
    <div class="head row" style="justify-content:space-between">
      <div style="font-weight:1000" id="pmTitle">Producto</div>
      <button class="btn" id="pmClose" type="button">Cerrar</button>
    </div>
    <div class="body">
      <div class="pmWrap">
        <div>
          <img id="pmMainImg" class="pmMainImg" alt="">
          <div id="pmThumbs" class="pmThumbs"></div>
        </div>
        <div>
          <div class="pmName" id="pmName"></div>
          <div class="pmChips" id="pmChips"></div>
          <div class="mut" id="pmCat"></div>
          <div class="pmPrice" id="pmPrice"></div>
          <div id="pmSave" class="pmSave" style="display:none"></div>

          <div class="pmBadges">
            <span class="badge off" id="pmStockOk" style="display:none"></span>
            <span class="badge low" id="pmStockLow" style="display:none">POCO STOCK</span>
            <span class="badge out" id="pmStockOut" style="display:none">AGOTADO</span>
          </div>

          <div class="pmTabs">
            <button id="pmTabBtn_desc" class="active" type="button">Descripción</button>
            <button id="pmTabBtn_specs" type="button">Especificaciones</button>
            <button id="pmTabBtn_videos" type="button">Videos</button>
          </div>

          <div id="pmTab_desc" class="pmPanel">
            <div class="pmDesc" id="pmDesc"></div>
          </div>
          <div id="pmTab_specs" class="pmPanel" style="display:none">
            <div class="pmSpecs" id="pmSpecs"></div>
          </div>
          <div id="pmTab_videos" class="pmPanel" style="display:none">
            <div class="pmActions" id="pmActions"></div>
          </div>

          <div id="recoBox"></div>

          <div class="pmQtyRow">
            <div class="pmQty">
              <button class="mini" id="pmMinus" type="button">-</button>
              <div class="pmQtyNum" id="pmQtyNum">1</div>
              <button class="mini" id="pmPlus" type="button">+</button>
            </div>

            <div class="pmBtnRow">
              <button class="btn acc" id="pmAddBtn" type="button">Añadir al carrito</button>
              <button class="btn ghost" id="pmBuyNowBtn" type="button">Comprar ahora</button>
            </div>
          </div>

          <div class="note" id="pmNote" style="margin-top:10px"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="modal" id="cartModal" aria-hidden="true">
  <div class="sheet">
    <div class="head row" style="justify-content:space-between">
      <div style="font-weight:1000">Carrito</div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn danger" id="clearCartBtn" type="button">Vaciar</button>
        <button class="btn" id="closeCart" type="button">Cerrar</button>
      </div>
    </div>

    <div class="body">
      <div id="checkoutBar" class="checkoutBar"></div>
      <div id="cartAlert" class="cartAlert"></div>
      <div id="checkoutBadge" class="checkoutBadge"></div>

      <div class="cartLayout">
        <div class="panel" id="stepProducts">
          <div class="panelTitle">Productos</div>
          <div id="cartItems"></div>
          <div class="note" id="cartEmptyNote" style="display:none">Tu carrito está vacío.</div>
        </div>

        <div class="panel" id="stepDelivery" style="display:none">
          <div class="panelTitle">Entrega y pago</div>
          <div class="two">
            <div><label class="mut">Departamento</label><select id="dep"></select></div>
            <div><label class="mut">Municipio</label><select id="mun"></select></div>
          </div>
          <div class="two" style="margin-top:10px">
            <div>
              <label class="mut">Tipo de entrega</label>
              <select id="deliveryType"></select>
              <div class="note" id="deliveryNote" style="margin-top:6px"></div>
            </div>
            <div>
              <label class="mut">Forma de pago</label>
              <select id="payType">
                <option value="pagar_al_recibir">PAGAR AL RECIBIR</option>
                <option value="prepago">PREPAGO (depósito)</option>
              </select>
              <div class="note" id="payNote" style="margin-top:6px"></div>
            </div>
          </div>

          <div id="cashBox" style="display:none;margin-top:10px">
            <label class="mut">¿Con cuánto pagará? (para calcular cambio)</label>
            <input id="cashAmount" inputmode="numeric" placeholder="Ej: 500" />
          </div>

          <div class="hr"></div>
          <div class="panelTitle">Resumen</div>
          <div id="summary"></div>
          <div class="cartMini" id="cartMiniSummary" style="margin-top:10px"></div>
        </div>

        <div class="panel" id="stepConfirm" style="display:none">
          <div class="panelTitle">Datos del cliente</div>
          <div class="two">
            <div><label class="mut">Nombre</label><input id="name" placeholder="Tu nombre" /></div>
            <div><label class="mut">Teléfono</label><input id="phone" placeholder="Ej: 9xxx-xxxx" /></div>
          </div>
          <div style="margin-top:10px">
            <label class="mut">Dirección / Referencia</label>
            <textarea id="addr" placeholder="Colonia, barrio, referencias..."></textarea>
          </div>
          <div style="margin-top:10px">
            <label class="mut">Instrucciones de entrega (opcional)</label>
            <textarea id="clientNote" placeholder="Ej: llamar antes / dejar en portón..."></textarea>
          </div>
          <div class="hr"></div>
          <div class="two">
            <button class="btn ghost" id="copyOrderBtn" type="button">Copiar pedido</button>
            <button class="btn ghost" id="shareOrderBtn" type="button">Compartir</button>
          </div>
          <button class="btn acc" id="sendWA" style="width:100%;margin-top:10px" type="button">Enviar pedido por WhatsApp</button>
          <div class="panel" id="orderHistory" style="margin-top:12px"></div>
        </div>
      </div>

      <div class="wizardNav">
        <button class="btn ghost" id="prevStepBtn" type="button">Atrás</button>
        <button class="btn acc" id="nextStepBtn" type="button">Continuar</button>
      </div>

      <div class="wizardErr" id="wizardErr"></div>
    </div>
  </div>
</div>
    `;
  }
  mount();
})();