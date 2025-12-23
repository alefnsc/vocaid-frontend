import { useEffect, useState, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { Modal } from "components/ui/modal";
import { Button } from "components/ui/button";
import { Mic, Settings, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useLocation } from 'react-router-dom';
import useCreditsRestoration from "hooks/use-credits-restoration";

interface MicPermissionCheckProps {
  onPermissionGranted: (granted: boolean) => void;
}

const MicPermissionCheck: React.FC<MicPermissionCheckProps> = ({ onPermissionGranted }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<"checking" | "granted" | "denied" | "unsupported" | "error">("checking");
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [creditRestored, setCreditRestored] = useState(false);

  const location = useLocation();
  const { body } = location.state || {};
  const { restoreCredits } = useCreditsRestoration();

  const checkMicrophonePermission = useCallback(async () => {
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionStatus("unsupported");
        setIsModalOpen(true);
        return;
      }

      // Try to get the microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Permission granted
      setPermissionStatus("granted");
      onPermissionGranted(true);

      // Stop all tracks to release the microphone
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      console.error("Microphone permission error:", error);

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setPermissionStatus("denied");
      } else {
        setPermissionStatus("error");
      }
      setIsModalOpen(true);
    }
  }, [onPermissionGranted]);

  useEffect(() => {
    checkMicrophonePermission();
  }, [checkMicrophonePermission]);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus("granted");
      setIsModalOpen(false);
      onPermissionGranted(true);

      // Stop all tracks to release the microphone
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Failed to get microphone permission:", error);
      setPermissionStatus("denied");
      setShowTroubleshooting(true);
    }
  };

  const handleCancelInterview = async () => {
    if (body?.metadata?.interview_id && !creditRestored) {
      const result = await restoreCredits(body.metadata.interview_id);
      if (result.success) {
        setCreditRestored(true);
      }
    }

    setIsModalOpen(false);
    if (permissionStatus !== "granted") {
      onPermissionGranted(false);
    }
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    return "your browser";
  };

  const getBrowserInstructions = () => {
    const browser = getBrowserName();
    const instructionClass = "text-gray-600 text-sm";

    switch (browser) {
      case "Chrome":
        return (
          <ol className={`list-decimal list-inside text-left space-y-2 ${instructionClass}`}>
            <li>{t('interview.micModal.instructions.chrome.step1')}</li>
            <li>{t('interview.micModal.instructions.chrome.step2')}</li>
            <li>{t('interview.micModal.instructions.chrome.step3')}</li>
          </ol>
        );
      case "Firefox":
        return (
          <ol className={`list-decimal list-inside text-left space-y-2 ${instructionClass}`}>
            <li>{t('interview.micModal.instructions.firefox.step1')}</li>
            <li>{t('interview.micModal.instructions.firefox.step2')}</li>
            <li>{t('interview.micModal.instructions.firefox.step3')}</li>
          </ol>
        );
      case "Safari":
        return (
          <ol className={`list-decimal list-inside text-left space-y-2 ${instructionClass}`}>
            <li>{t('interview.micModal.instructions.safari.step1')}</li>
            <li>{t('interview.micModal.instructions.safari.step2')}</li>
            <li>{t('interview.micModal.instructions.safari.step3')}</li>
          </ol>
        );
      default:
        return (
          <ol className={`list-decimal list-inside text-left space-y-2 ${instructionClass}`}>
            <li>{t('interview.micModal.instructions.default.step1')}</li>
            <li>{t('interview.micModal.instructions.default.step2')}</li>
            <li>{t('interview.micModal.instructions.default.step3')}</li>
          </ol>
        );
    }
  };

  return (
    <Modal
      title={
        permissionStatus === "unsupported"
          ? t('interview.micModal.titles.unsupported')
          : showTroubleshooting
            ? t('interview.micModal.titles.troubleshooting')
            : t('interview.micModal.titles.required')
      }
      isOpen={isModalOpen}
      onClose={handleCancelInterview}
      className="max-w-md sm:max-w-lg"
    >
      <div className="p-2 sm:p-4 flex flex-col items-center">
        {showTroubleshooting ? (
          <>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
            </div>
            <p className="text-gray-600 mb-4 text-center text-sm sm:text-base">
              {t('interview.micModal.troubleshootingMessage')}
            </p>

            <div className="w-full bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="text-sm sm:text-base font-medium text-gray-800 mb-3 flex items-center">
                <Settings className="mr-2 w-4 h-4 text-purple-500" /> 
                {t('interview.micModal.enableMicIn', { browser: getBrowserName() })}
              </h3>
              {getBrowserInstructions()}
            </div>

            {creditRestored && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4 w-full">
                <p className="text-green-700 text-sm">
                  {t('interview.micModal.creditRestored')}
                </p>
              </div>
            )}
          </>
        ) : permissionStatus === "unsupported" ? (
          <>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
            </div>
            <p className="text-gray-600 mb-4 text-center text-sm sm:text-base">
              {t('interview.micModal.unsupportedMessage')}
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
            </div>
            <p className="text-gray-600 mb-4 text-center text-sm sm:text-base">
              {t('interview.micModal.requiredMessage')}
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-3 sm:gap-4 mt-4">
          <Button
            variant="outline"
            size="default"
            onClick={handleCancelInterview}
            className="w-full sm:w-auto flex items-center justify-center border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            {t('interview.micModal.returnHome')}
          </Button>

          {!showTroubleshooting && permissionStatus !== "unsupported" && (
            <Button 
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
              variant="default" 
              size="default"
              onClick={requestPermission}
            >
              <Mic className="mr-2 w-4 h-4" />
              {t('interview.micModal.enableButton')}
            </Button>
          )}

          {showTroubleshooting && (
            <Button
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
              variant="default"
              size="default"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              {t('interview.micModal.refreshButton')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MicPermissionCheck;