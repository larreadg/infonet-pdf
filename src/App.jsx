import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import './App.css'
import infonet from './assets/infonet.pdf'
import dayjs from 'dayjs';

function App() {

  const [boleta, setBoleta] = useState(0);
  const [monto, setMonto] = useState(0);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === 'boleta') {
      setBoleta(value);
    } else if (name === 'monto') {
      setMonto(value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // console.log(`Boleta: ${boleta}, Monto: ${monto}`);
    const currentDateTime = dayjs();
  
    // Carga el documento PDF
    const response = await fetch(infonet);
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
  
    // Obtén la primera página del documento
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
  
    // Define una fuente
    const font = await pdfDoc.embedFont(StandardFonts.CourierBold);
  
    // Escribe la fecha
    firstPage.drawText(currentDateTime.format('DD/MM/YYYY'), {
      x: 48,
      y: 131,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    // Escribe la hora
    firstPage.drawText(currentDateTime.format('HH:mm'), {
      x: 42,
      y: 104,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });

    // Escribe nro de boleta
    firstPage.drawText(boleta, {
      x: 55,
      y: 77,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
    
    // Escribe el monto
    firstPage.drawText(`${monto}Gs.`, {
      x: 67,
      y: 50,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
  
    // Guarda el documento modificado
    const modifiedPdfBytes = await pdfDoc.save();
  
    // Descarga el archivo
    const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    saveAs(blob, `infonet_${new Date().getTime()}.pdf`);
  };

  return (
    <>
      <section className='infonet'>
        <h1 className='infonet_title'>Generar comprobante Infonet</h1>
        <form onSubmit={handleSubmit} className='infonet_form'>
          <section className='infonet_form_input_group'>
            <label>Nro. Boleta</label>
            <input type="number" name="boleta" value={boleta} onChange={handleInputChange} />
          </section>
          <section className='infonet_form_input_group'>
            <label>Monto Gs.</label>
            <input type="number" name="monto" value={monto} onChange={handleInputChange} />
          </section>
          <input className={`infonet_form_submit ${boleta == 0 || monto == 0 ? 'disabled' : ''}`} type="submit" value="Generar PDF" disabled={boleta == 0 || monto == 0 }/>
        </form>
      </section>

    </>
  )
}

export default App
