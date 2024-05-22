import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import './App.css'
import infonet from './assets/infonet.pdf'
import dayjs from 'dayjs';

function App() {

  const [boleta, setBoleta] = useState(0);
  const [monto, setMonto] = useState(0);
  const [servicio, setServicio] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === 'boleta') {
      setBoleta(value);
    } else if (name === 'monto') {
      setMonto(value);
    } else if (name === 'servicio') {
      setServicio(value);
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
    const fontSize = 9;
  
    // Define una fuente
    const font = await pdfDoc.embedFont(StandardFonts.CourierBold);
  
    // Escribe la fecha
    firstPage.drawText(currentDateTime.format('DD/MM/YYYY'), {
      x: 48,
      y: 175,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    // Escribe la hora
    firstPage.drawText(currentDateTime.format('HH:mm'), {
      x: 42,
      y: 148,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    // Escribe nro de boleta
    firstPage.drawText(boleta, {
      x: 55,
      y: 120,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    
    // Escribe el monto
    firstPage.drawText(`${monto}Gs.`, {
      x: 48,
      y: 93,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    
    // Define el ancho del PDF y la posición inicial en puntos
    const pdfWidth = 164; // Aproximadamente 58mm
    const initialX = 67;

    // Calcula el ancho máximo para el texto
    const maxWidth = pdfWidth - initialX;

    // Calcula el ancho del texto
    
    const textWidth = font.widthOfTextAtSize(servicio, fontSize);

    if (textWidth > maxWidth) {
      // Si el texto es demasiado largo, divídelo en palabras
      const words = servicio.split(' ');
      let lines = [''];
      let i = 0;

      // Añade palabras a las líneas, asegurándote de que no excedan el ancho máximo
      words.forEach(word => {
        const potentialLine = lines[i] + ' ' + word;
        const potentialLineWidth = font.widthOfTextAtSize(potentialLine, fontSize);

        if (potentialLineWidth > maxWidth) {
          // Si la línea potencial es demasiado larga, comienza una nueva línea
          i++;
          lines[i] = word;
        } else {
          // Si no, añade la palabra a la línea actual
          lines[i] = potentialLine;
        }
      });

      // Escribe cada línea en el PDF
      lines.forEach((line, index) => {
        firstPage.drawText(line.trim(), {
          x: index == 0 ? initialX : 5,
          y: 65 - index * 15, // Ajusta la posición y para cada línea
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });
    } else {
      // Si el texto cabe en una línea, escríbelo normalmente
      firstPage.drawText(servicio, {
        x: initialX,
        y: 65,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }
  
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
          <section className='infonet_form_input_group'>
            <label>Servicio</label>
            <input type="text" name="servicio" placeholder='Giro Tigo Money' value={servicio} onChange={handleInputChange} />
          </section>
          <input className={`infonet_form_submit ${boleta == 0 || monto == 0 || servicio == '' ? 'disabled' : ''}`} type="submit" value="Generar PDF" disabled={boleta == 0 || monto == 0 || servicio == ''}/>
        </form>
      </section>

    </>
  )
}

export default App
