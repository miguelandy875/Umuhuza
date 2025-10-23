import { useEffect, useRef, forwardRef } from 'react';

interface LocationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
}

const LocationInput = forwardRef<HTMLInputElement, LocationInputProps>(
  ({ label, error, onPlaceSelected, ...props }, ref) => {
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      // Check if Google Maps API is loaded
      if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.warn('Google Maps JavaScript API not loaded. Using regular input.');
        return;
      }

      if (!inputRef.current) return;

      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'bi' }, // Restrict to Burundi
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      });

      // Add place changed listener
      const listener = autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && onPlaceSelected) {
          onPlaceSelected(place);
        }
      });

      return () => {
        if (listener) {
          google.maps.event.removeListener(listener);
        }
      };
    }, [onPlaceSelected]);

    const setRefs = (element: HTMLInputElement) => {
      inputRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={setRefs}
          className={`input ${error ? 'border-red-500' : ''}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {typeof google === 'undefined' && (
          <p className="mt-1 text-xs text-gray-500">
            Google Places API not configured. Using manual input.
          </p>
        )}
      </div>
    );
  }
);

LocationInput.displayName = 'LocationInput';

export default LocationInput;
