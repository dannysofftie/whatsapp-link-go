import * as IntentLauncher from 'expo-intent-launcher';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import CountryPicker, { Country, CountryCode, DARK_THEME } from 'react-native-country-picker-modal';
import { X } from 'react-native-feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const WhatsAppLauncher = () => {
  // Changed default country to Kenya (KE)
  const [countryCode, setCountryCode] = useState<CountryCode>('KE');
  const [country, setCountry] = useState<Country>({
    callingCode: ['254'], // Kenya's calling code
    cca2: 'KE',
    currency: ['KES'],
    flag: 'flag-ke',
    name: 'Kenya',
    region: 'Africa',
    subregion: 'Eastern Africa',
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const { height: screenHeight } = Dimensions.get('window');

  // Set up transparent status bar and keyboard listeners when component mounts
  useEffect(() => {
    // Set up keyboard listeners
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        // Animate content up when keyboard shows
        Animated.timing(contentTranslateY, {
          toValue: Platform.OS === 'ios' ? -80 : -60, // Adjust based on platform
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        // Animate content back to original position
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Force ScrollView to reset its content position
        if (scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
          }, 50);
        }
      }
    );

    return () => {
      // Clean up listeners and reset status bar when component unmounts
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [contentTranslateY]);

  const onSelectCountry = (selectedCountry: Country) => {
    setCountryCode(selectedCountry.cca2);
    setCountry(selectedCountry);
    setIsPickerVisible(false);
  };

  const validatePhoneNumber = (number: string) => {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, '');

    // Basic validation
    if (cleanNumber.length === 0) {
      setIsValid(false);
      setErrorMessage('Phone number is required');
      return false;
    } else if (cleanNumber.length < 5) {
      setIsValid(false);
      setErrorMessage('Phone number is too short');
      return false;
    } else {
      setIsValid(true);
      setErrorMessage('');
      return true;
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    validatePhoneNumber(text);
  };

  const handleButtonPress = async () => {
    Keyboard.dismiss(); // Dismiss keyboard when button is pressed

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Validate phone number
    if (validatePhoneNumber(phoneNumber)) {
      // Format phone number by removing any non-digit characters
      const formattedNumber = phoneNumber.replace(/\D/g, '');

      // Open WhatsApp with the phone number
      const whatsappUrl = `whatsapp://send?phone=${country.callingCode[0]}${formattedNumber}`;
      if (Platform.OS === 'android') {
        try {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: whatsappUrl,
            packageName: 'com.whatsapp',
          });
        } catch (_e) {
          alert('WhatsApp not installed or cannot be opened');
        }
      } else {
        Linking.openURL(whatsappUrl).catch(() => {
          alert('WhatsApp not installed or cannot be opened');
        });
      }
    }
  };

  return (
    <View className="flex-1 bg-[#1a1a2e]">
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        // Extra height for background to prevent white space
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: screenHeight + 100,
        }}
        className="absolute inset-0"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ flexGrow: 1 }}
            className="bg-transparent"
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}>
            <Animated.View
              className="flex-1 justify-center bg-transparent p-6"
              style={{ transform: [{ translateY: contentTranslateY }] }}>
              <View className={`items-center bg-transparent ${keyboardVisible ? 'mb-4' : 'mb-12'}`}>
                <Text className="mb-2 text-4xl font-bold text-white">WhatsApp Direct</Text>
                {!keyboardVisible && (
                  <Text className="text-center text-gray-400">
                    Connect instantly without saving contacts
                  </Text>
                )}
              </View>

              <View className="rounded-3xl border border-gray-700/50 bg-gray-800/60 p-6 shadow-2xl backdrop-blur-lg">
                <Text className="mb-2 text-sm text-gray-400">Enter phone number</Text>

                <View className="mb-2 flex-row">
                  {/* Country code selector using react-native-country-picker-modal */}
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setIsPickerVisible(true);
                    }}
                    className="h-14 flex-row items-center justify-center rounded-l-xl border-r border-gray-600 bg-gray-700/50 px-3">
                    <CountryPicker
                      countryCode={countryCode}
                      withFlag
                      withCallingCode
                      withCallingCodeButton
                      withFlagButton
                      withFilter
                      withModal
                      visible={isPickerVisible}
                      onSelect={onSelectCountry}
                      onClose={() => setIsPickerVisible(false)}
                      renderFlagButton={() => (
                        <View className="flex-row items-center">
                          <CountryPicker
                            countryCode={countryCode}
                            withFlag
                            withCallingCodeButton={false}
                            withCountryNameButton={false}
                            onSelect={() => {}}
                            visible={false}
                            theme={DARK_THEME}
                          />
                          <Text className="ml-2 mr-1 text-lg text-white">
                            +{country.callingCode[0]}
                          </Text>
                          <View className="ml-1">
                            <Text className="text-white">▼</Text>
                          </View>
                        </View>
                      )}
                      theme={DARK_THEME}
                      containerButtonStyle={{ alignItems: 'center' }}
                    />
                  </TouchableOpacity>

                  {/* Phone number input */}
                  <View className="relative flex-1">
                    <TextInput
                      className={`h-14 rounded-r-xl bg-gray-700/50 px-4 text-lg text-white ${!isValid ? 'border border-red-500' : ''}`}
                      placeholder="Phone number"
                      placeholderTextColor="#9ca3af"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={handlePhoneNumberChange}
                    />
                    {phoneNumber.length > 0 && (
                      <TouchableOpacity
                        className="absolute right-3 top-4"
                        onPress={() => {
                          setPhoneNumber('');
                          setIsValid(true);
                          setErrorMessage('');
                        }}>
                        <X width={20} height={20} color="#9ca3af" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Error message */}
                {!isValid && <Text className="mb-4 ml-2 text-sm text-red-500">{errorMessage}</Text>}

                {/* Button with WhatsApp icon */}
                <Pressable
                  onPress={handleButtonPress}
                  disabled={!isValid || phoneNumber.length === 0}
                  className={`mt-4 ${!isValid || phoneNumber.length === 0 ? 'opacity-70' : 'opacity-100'}`}>
                  <Animated.View
                    style={{ transform: [{ scale: buttonScale }] }}
                    className="overflow-hidden rounded-full">
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="absolute inset-0 rounded-full"
                    />
                    <View className="flex-row items-center justify-center gap-x-2 py-4">
                      <FontAwesome name="whatsapp" size={20} color="white" />
                      <Text className="text-lg font-bold text-white">Open Chat</Text>
                    </View>
                  </Animated.View>
                </Pressable>
              </View>

              {!keyboardVisible && (
                <View className="mt-8 items-center">
                  <Text className="text-sm text-gray-500">
                    No contacts are stored on our servers
                  </Text>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

export default WhatsAppLauncher;
