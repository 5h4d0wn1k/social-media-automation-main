import React, { useState, useEffect, useRef } from 'react';
import { Check, Copy, AlertCircle, Phone, Shield, RefreshCw, QrCode, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { verifyWhatsAppNumber, registerWhatsAppAccount, verifyWhatsAppAccount, checkWhatsAppRegistration } from '@/lib/api/whatsapp';
import { env } from '@/config/env';
import { useSocialStore } from '@/lib/store';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { copy } from '@/lib/utils';

interface RegistrationResponse {
  success: boolean;
  message: string;
  vname?: string;
  status?: 'created' | 'accepted' | 'error';
}

interface WhatsAppSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * WhatsApp Business API Setup Component
 * Handles all WhatsApp configuration including certificate management and phone verification
 */
export function WhatsAppSetup({ open, onOpenChange }: WhatsAppSetupProps) {
  const [displayName, setDisplayName] = useState('Shadownik');
  const [certificate, setCertificate] = useState('MIIB4TFkATnJlZUuXxQRxr92HJcALUWvSiAbLxqPY2...'); // Placeholder cert
  const [copySuccess, setCopySuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('1');
  const [verificationMethod, setVerificationMethod] = useState<'sms' | 'voice'>('sms');
  const [twoStepPin, setTwoStepPin] = useState('');
  const [useTwoStep, setUseTwoStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Verification status states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Registration states
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'start' | 'verify'>('start');
  const [registrationMessage, setRegistrationMessage] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if WhatsApp is already registered
  useEffect(() => {
    if (open) {
      checkRegistrationStatus();
    }
  }, [open]);

  const checkRegistrationStatus = async () => {
    setIsCheckingRegistration(true);
    try {
      const result = await checkWhatsAppRegistration();
      setIsRegistered(result.isRegistered);
      if (result.isRegistered && result.phoneNumber) {
        const phoneWithoutCode = result.phoneNumber.replace(/^\+\d+/, '');
        const countryCodeMatch = result.phoneNumber.match(/^\+(\d+)/);
        
        if (countryCodeMatch && countryCodeMatch[1]) {
          setCountryCode(countryCodeMatch[1]);
        }
        
        setPhoneNumber(phoneWithoutCode);
        if (result.displayName) {
          setDisplayName(result.displayName);
        }
        
        setRegistrationStep('start');
        setVerificationSuccess(true);
        setVerificationMessage('Your WhatsApp Business account is already registered and ready to use.');
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    } finally {
      setIsCheckingRegistration(false);
    }
  };

  const handleCopyCertificate = async () => {
    if (textareaRef.current) {
      await copy(textareaRef.current.value);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSaveConfig = async () => {
    setIsVerifying(true);
    setVerificationMessage('');
    setVerificationSuccess(false);
    
    try {
      const result = await verifyWhatsAppNumber(certificate, displayName);
      setVerificationSuccess(result.success);
      setVerificationMessage(result.message);
    } catch (error) {
      console.error('Error verifying WhatsApp setup:', error);
      setVerificationSuccess(false);
      setVerificationMessage('An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasteCertificate = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCertificate(text);
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
    }
  };

  const handleRequestVerificationCode = async () => {
    if (!phoneNumber || !countryCode) {
      setRegistrationMessage('Please enter a valid phone number and country code.');
      return;
    }

    setIsRegistering(true);
    setRegistrationMessage('');
    
    try {
      const result = await registerWhatsAppAccount(
        countryCode,
        phoneNumber,
        verificationMethod,
        certificate,
        useTwoStep ? twoStepPin : undefined
      );
      
      if (result.success) {
        // If the account is already created, we can skip to verification success
        if (result.status === 'created') {
          setVerificationSuccess(true);
          setVerificationMessage(result.message);
          setIsRegistered(true);
          setRegistrationStep('start');
        } else {
          // Otherwise, move to verification step
          setRegistrationMessage(result.message);
          setRegistrationStep('verify');
        }
      } else {
        setRegistrationMessage(result.message);
      }
    } catch (error) {
      console.error('Error requesting verification code:', error);
      setRegistrationMessage('An error occurred while requesting the verification code. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!verificationCode) {
      setRegistrationMessage('Please enter the verification code.');
      return;
    }

    setIsRegistering(true);
    setRegistrationMessage('');
    
    try {
      const result = await verifyWhatsAppAccount(
        countryCode,
        phoneNumber,
        verificationCode
      );
      
      if (result.success) {
        setVerificationSuccess(true);
        setVerificationMessage(result.message);
        setIsRegistered(true);
        setRegistrationStep('start');
      } else {
        setRegistrationMessage(result.message);
      }
    } catch (error) {
      console.error('Error verifying account:', error);
      setRegistrationMessage('An error occurred during verification. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl mx-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold mb-4">
            <Avatar className="h-8 w-8 bg-green-500/10">
              <AvatarFallback className="text-green-500">Wa</AvatarFallback>
            </Avatar>
            WhatsApp Business Setup
          </DialogTitle>
        </DialogHeader>

        {isCheckingRegistration ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
            <span className="ml-3">Checking registration status...</span>
          </div>
        ) : (
          <>
            {isRegistered ? (
              // Already registered view
              <div className="space-y-4">
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">WhatsApp Business Account Registered</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Your WhatsApp Business account is active and ready to send messages.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Business Display Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your business name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="country-code"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-20"
                        placeholder="Code"
                        disabled
                      />
                      <Input
                        id="phone-number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1"
                        placeholder="Phone number without country code"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={handleSaveConfig} disabled={isVerifying}>
                    Update WhatsApp Settings
                  </Button>
                </div>
              </div>
            ) : (
              // Registration flow
              <>
                {registrationStep === 'start' ? (
                  // Initial registration step
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Business Display Name</Label>
                      <Input
                        id="display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your business name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="certificate">WhatsApp Certificate</Label>
                      <div className="relative">
                        <Textarea
                          id="certificate"
                          ref={textareaRef}
                          value={certificate}
                          onChange={(e) => setCertificate(e.target.value)}
                          className="min-h-32 pr-10"
                          placeholder="Paste your WhatsApp certificate here"
                        />
                        <div className="absolute right-2 top-2 flex flex-col gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handlePasteCertificate}
                            title="Paste from clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone-number">Phone Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="country-code"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-20"
                          placeholder="Code"
                        />
                        <Input
                          id="phone-number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="flex-1"
                          placeholder="Phone number without country code"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Verification Method</Label>
                      <RadioGroup 
                        value={verificationMethod} 
                        onValueChange={(value: string) => setVerificationMethod(value as 'sms' | 'voice')}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sms" id="sms" />
                          <Label htmlFor="sms" className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            SMS
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="voice" id="voice" />
                          <Label htmlFor="voice" className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            Voice Call
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="two-step" 
                        checked={useTwoStep}
                        onCheckedChange={setUseTwoStep}
                      />
                      <Label htmlFor="two-step">Enable two-step verification</Label>
                    </div>
                    
                    {useTwoStep && (
                      <div className="space-y-2">
                        <Label htmlFor="pin">Two-Step PIN (6 digits)</Label>
                        <Input
                          id="pin"
                          value={twoStepPin}
                          onChange={(e) => setTwoStepPin(e.target.value)}
                          maxLength={6}
                          placeholder="Enter a 6-digit PIN"
                        />
                      </div>
                    )}
                    
                    {registrationMessage && (
                      <div className={`p-3 rounded-md ${registrationMessage.includes('error') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                        {registrationMessage}
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      onClick={handleRequestVerificationCode} 
                      disabled={isRegistering}
                    >
                      {isRegistering ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
                          Requesting Code...
                        </>
                      ) : (
                        'Request Verification Code'
                      )}
                    </Button>
                  </div>
                ) : (
                  // Verification code step
                  <div className="space-y-4">
                    <div className="rounded-md bg-blue-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Verification Code Sent</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>Please enter the verification code sent to your phone.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <Input
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter the verification code"
                      />
                    </div>
                    
                    {registrationMessage && (
                      <div className={`p-3 rounded-md ${registrationMessage.includes('error') ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
                        {registrationMessage}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setRegistrationStep('start')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      
                      <Button 
                        className="flex-1" 
                        onClick={handleCompleteRegistration} 
                        disabled={isRegistering}
                      >
                        {isRegistering ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
                            Verifying...
                          </>
                        ) : (
                          'Complete Registration'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {verificationMessage && (
              <div className={`mt-4 p-3 rounded-md ${verificationSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {verificationMessage}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 