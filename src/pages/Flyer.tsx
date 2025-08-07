import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import flyerImage from "@/assets/pulserun-flyer-with-logo.jpg";
import logoImage from "@/assets/pulserun-logo.png";

const Flyer = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = flyerImage;
    link.download = 'pulserun-folder-promocional-oficial.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header com navegação */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
            
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="PulseRun" className="h-8 w-8" />
              <h1 className="text-2xl font-bold text-gray-800">Folder Promocional</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleDownload}
              className="running-gradient text-white hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Imagem
            </Button>
            
            <Button 
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Instruções para impressão */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6 print:hidden">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Instruções para Impressão:</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Configure sua impressora para papel A4</li>
            <li>• Selecione qualidade alta (300 DPI ou superior)</li>
            <li>• Use papel de boa qualidade para melhor resultado</li>
            <li>• Certifique-se de que as margens estão configuradas adequadamente</li>
          </ul>
        </div>

        {/* Preview do folder */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <img 
            src={flyerImage} 
            alt="Folder Promocional PulseRun" 
            className="w-full h-auto max-w-full"
            style={{ pageBreakInside: 'avoid' }}
          />
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 print:hidden">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Sugestões de Distribuição:</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• <strong>Durante as corridas:</strong> Distribua na área de hidratação ou chegada</p>
            <p>• <strong>Retirada de kits:</strong> Deixe folders disponíveis nos estandes</p>
            <p>• <strong>Lojas de esportes:</strong> Parcerias para exposição do material</p>
            <p>• <strong>Grupos de corrida:</strong> Compartilhe em grupos do WhatsApp e redes sociais</p>
          </div>
        </div>
      </div>

      {/* CSS para impressão */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white !important;
            }
            
            .print\\:hidden {
              display: none !important;
            }
            
            img {
              max-width: 100% !important;
              height: auto !important;
              page-break-inside: avoid;
            }
          }
        `
      }} />
    </div>
  );
};

export default Flyer;