import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import flyerImage from "@/assets/pulserun-promotional-flyer.jpg";
import logoImage from "@/assets/pulserun-logo.png";

const FlyerPromocional = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = flyerImage;
    link.download = 'pulserun-flyer-promocional.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-violet-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header com navegação */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
            
            <h1 className="text-2xl font-bold text-white">Flyer Promocional</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleDownload}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Flyer
            </Button>
            
            <Button 
              variant="outline"
              onClick={handlePrint}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Instruções para uso */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6 print:hidden">
          <h2 className="text-lg font-semibold mb-2 text-white">Como usar este flyer:</h2>
          <ul className="text-sm text-white/80 space-y-1">
            <li>• Imprima em papel A4 de alta qualidade</li>
            <li>• Distribua durante corridas e eventos esportivos</li>
            <li>• Coloque em murais de academias e centros esportivos</li>
            <li>• Compartilhe digitalmente nas redes sociais</li>
          </ul>
        </div>

        {/* Flyer personalizado */}
        <div className="bg-gradient-to-br from-purple-700 to-violet-900 rounded-lg shadow-2xl overflow-hidden p-8 text-white">
          {/* Header do flyer */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={logoImage} 
                alt="PulseRun Logo" 
                className="w-20 h-20"
              />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-white">PulseRun</h1>
            <p className="text-xl text-green-400 font-semibold">Seu companheiro para corridas perfeitas</p>
          </div>

          {/* Título principal */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-white">
              ORGANIZE SUAS CORRIDAS
              <br />
              <span className="text-green-400">COM FACILIDADE</span>
            </h2>
          </div>

          {/* Características do app */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg">Cadastre e gerencie suas corridas</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg">Acompanhe seu progresso</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg">Conecte-se com outros corredores</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg">Organize eventos esportivos</span>
              </div>
            </div>
          </div>

          {/* Call to action e QR Code */}
          <div className="text-center">
            <div className="bg-white/10 rounded-lg p-6 inline-block">
              <h3 className="text-2xl font-bold mb-4 text-green-400">BAIXE AGORA!</h3>
              
              {/* QR Code placeholder */}
              <div className="bg-white rounded-lg p-4 mb-4 inline-block">
                <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-white" />
                </div>
              </div>
              
              <p className="text-sm text-white/80">
                Escaneie o QR Code ou procure<br />
                <span className="font-bold text-green-400">PulseRun</span> na sua loja de apps
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-white/20">
            <p className="text-lg font-semibold text-green-400">
              Transforme sua paixão por corrida em resultados!
            </p>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 print:hidden">
          <h3 className="text-lg font-semibold mb-2 text-white">Dicas de distribuição:</h3>
          <div className="text-sm text-white/80 space-y-2">
            <p>• <strong>Durante as corridas:</strong> Distribua na área de largada, chegada ou hidratação</p>
            <p>• <strong>Retirada de kits:</strong> Inclua o flyer no material dos participantes</p>
            <p>• <strong>Lojas de esportes:</strong> Estabeleça parcerias para exposição do material</p>
            <p>• <strong>Grupos de corrida:</strong> Compartilhe digitalmente em grupos do WhatsApp e redes sociais</p>
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
            
            .bg-gradient-to-br {
              background: linear-gradient(135deg, #7c3aed, #5b21b6) !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            * {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        `
      }} />
    </div>
  );
};

export default FlyerPromocional;