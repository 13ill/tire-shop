# React UX Patterns & Skills

## 📋 Overview

This document captures the UX patterns, React skills, and implementation techniques learned from the POS+Stock project, specifically focusing on the SurveyJS dropdown implementation and automotive UX best practices.

## 🎯 Core React Patterns

### 1. Controlled Component Pattern
```typescript
// State management for controlled inputs
const [value, setValue] = useState('');
const [isOpen, setIsOpen] = useState(false);

// Input handler
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
  // Additional logic (filtering, validation, etc.)
};

// Render controlled input
<input
  type="text"
  value={value}
  onChange={handleChange}
  onFocus={() => setIsOpen(true)}
  onBlur={() => setTimeout(() => setIsOpen(false), 200)}
/>
```

### 2. Conditional Rendering Pattern
```typescript
// Toggle between normal and custom input states
{!showCustomInput ? (
  // Normal dropdown input
  <>
    <input {...props} />
    {isOpen && <DropdownList />}
  </>
) : (
  // Custom input with buttons
  <div className="flex gap-2">
    <input {...customProps} />
    <button onClick={handleAdd}>Add</button>
    <button onClick={handleCancel}>Cancel</button>
  </div>
)}
```

### 3. Ref Management Pattern
```typescript
// Ref for focus management
const inputRef = useRef<HTMLInputElement>(null);

// Auto-focus on state change
useEffect(() => {
  if (showCustomInput) {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }
}, [showCustomInput]);

// Attach ref to input
<input ref={inputRef} />
```

### 4. Async State Management Pattern
```typescript
// Async operation with loading state
const [loading, setLoading] = useState(false);

const handleAsyncAction = async (data: string) => {
  try {
    setLoading(true);
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    const result = await response.json();
    
    if (result.success) {
      // Update state with result
      setValue(result.data.name);
      setIsOpen(false);
    }
  } catch (error) {
    console.error('Operation failed:', error);
  } finally {
    setLoading(false);
  }
};
```

## 🎨 UX Design Patterns

### 1. SurveyJS Dropdown Pattern
```typescript
interface SurveyJSDropdownState {
  displayValue: string;
  filteredItems: any[];
  isOpen: boolean;
  showCustomInput: boolean;
  selectedItem: any | null;
}

const useSurveyJSDropdown = (items: any[], onAdd: Function) => {
  const [state, setState] = useState<SurveyJSDropdownState>({
    displayValue: '',
    filteredItems: items,
    isOpen: false,
    showCustomInput: false,
    selectedItem: null,
  });

  const handleSearch = (value: string) => {
    setState(prev => ({
      ...prev,
      displayValue: value,
      filteredItems: items.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase())
      ),
      isOpen: true,
    }));
  };

  const handleSelect = (item: any) => {
    setState(prev => ({
      ...prev,
      displayValue: item.name,
      selectedItem: item,
      isOpen: false,
      showCustomInput: false,
    }));
  };

  const handleAddNew = () => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      showCustomInput: true,
      displayValue: '',
    }));
  };

  return {
    ...state,
    handleSearch,
    handleSelect,
    handleAddNew,
  };
};
```

### 2. Progressive Disclosure Pattern
```typescript
// Show options only when needed
const ProgressiveDropdown = () => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative">
      <input
        onFocus={() => setShowOptions(true)}
        onBlur={() => setTimeout(() => setShowOptions(false), 200)}
      />
      
      {showOptions && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
          {/* Options appear only on focus */}
        </div>
      )}
    </div>
  );
};
```

### 3. Search-as-you-type Pattern
```typescript
const SearchableDropdown = ({ items }: { items: any[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <DropdownList items={filteredItems} />
    </div>
  );
};
```

## 🔧 Advanced React Techniques

### 1. Custom Hook Pattern
```typescript
// Reusable dropdown logic
const useDropdown = <T extends { id: string; name: string }>(
  items: T[],
  onSelect: (item: T) => void
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsOpen(false);
    setSearchTerm(item.name);
  };

  return {
    isOpen,
    searchTerm,
    filteredItems,
    setIsOpen,
    setSearchTerm,
    handleSelect,
  };
};
```

### 2. Compound Component Pattern
```typescript
// Dropdown with compound components
const Dropdown = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </DropdownContext.Provider>
  );
};

Dropdown.Trigger = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, setIsOpen } = useContext(DropdownContext);
  
  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {children}
    </button>
  );
};

Dropdown.Content = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useContext(DropdownContext);
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg">
      {children}
    </div>
  );
};
```

### 3. Render Props Pattern
```typescript
const DropdownRenderProps = ({ children }: { children: (props: DropdownProps) => React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const props = {
    isOpen,
    selectedItem,
    setIsOpen,
    setSelectedItem,
  };

  return children(props);
};

// Usage
<DropdownRenderProps>
  {({ isOpen, selectedItem, setIsOpen, setSelectedItem }) => (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {selectedItem?.name || 'Select...'}
      </button>
      {isOpen && (
        <div className="dropdown-content">
          {/* Dropdown items */}
        </div>
      )}
    </div>
  )}
</DropdownRenderProps>
```

## 🎯 Automotive UX Best Practices

### 1. Visual Hierarchy
```typescript
// Clear visual hierarchy with icons and spacing
const VehicleBrandItem = ({ brand, onSelect }: { brand: any; onSelect: Function }) => (
  <div 
    className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
    onClick={() => onSelect(brand)}
  >
    <div className="flex items-center">
      <span className="text-lg mr-2">🚗</span>
      <span className="font-medium">{brand.name}</span>
    </div>
  </div>
);
```

### 2. Progressive Disclosure
```typescript
// Show complexity gradually
const VehicleSelector = () => {
  const [step, setStep] = useState<'brand' | 'model' | 'details'>('brand');
  
  return (
    <div>
      {step === 'brand' && (
        <BrandSelection onNext={() => setStep('model')} />
      )}
      {step === 'model' && (
        <ModelSelection onNext={() => setStep('details')} />
      )}
      {step === 'details' && (
        <VehicleDetails />
      )}
    </div>
  );
};
```

### 3. Error Prevention
```typescript
// Prevent errors by validating dependencies
const ModelSelector = ({ selectedBrand }: { selectedBrand: any }) => {
  const handleAddModel = async (modelName: string) => {
    if (!selectedBrand) {
      alert('กรุณาเลือกยี่ห้อรถก่อนเพิ่มรุ่นใหม่');
      return;
    }
    
    // Proceed with adding model
  };
  
  return (
    <div>
      <input disabled={!selectedBrand} />
      <button onClick={handleAddModel} disabled={!selectedBrand}>
        Add Model
      </button>
    </div>
  );
};
```

## 🚀 Performance Optimization

### 1. Debounced Search
```typescript
import { useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

const useDebounceSearch = (items: any[], delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setSearchTerm(term);
    }, delay),
    [delay]
  );

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  return { searchTerm, filteredItems, debouncedSearch };
};
```

### 2. Virtual Scrolling
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedDropdown = ({ items }: { items: any[] }) => {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <List
      height={200}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 3. Memoized Components
```typescript
const DropdownItem = React.memo(({ item, onSelect }: { 
  item: any; 
  onSelect: Function 
}) => {
  return (
    <div onClick={() => onSelect(item)}>
      {item.name}
    </div>
  );
});

DropdownItem.displayName = 'DropdownItem';
```

## 📱 Responsive Design Patterns

### 1. Mobile-First Dropdown
```typescript
const ResponsiveDropdown = () => {
  return (
    <div className="w-full">
      <div className="block md:hidden">
        {/* Mobile layout */}
        <MobileDropdown />
      </div>
      <div className="hidden md:block">
        {/* Desktop layout */}
        <DesktopDropdown />
      </div>
    </div>
  );
};
```

### 2. Touch-Friendly Interface
```typescript
const TouchDropdown = () => {
  return (
    <div className="touch-friendly">
      <button className="p-4 min-h-[44px] min-w-[44px]">
        {/* Touch target minimum 44x44px */}
      </button>
      <div className="dropdown-content p-4">
        {/* Larger touch targets */}
      </div>
    </div>
  );
};
```

## 🔍 Testing Patterns

### 1. Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SurveyJSDropdown } from './SurveyJSDropdown';

describe('SurveyJSDropdown', () => {
  test('should filter items on search', () => {
    const items = [{ id: '1', name: 'Toyota' }, { id: '2', name: 'Honda' }];
    render(<SurveyJSDropdown items={items} />);
    
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'Toyota' } });
    
    expect(screen.getByText('Toyota')).toBeInTheDocument();
    expect(screen.queryByText('Honda')).not.toBeInTheDocument();
  });
});
```

### 2. Integration Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useSurveyJSDropdown } from './useSurveyJSDropdown';

describe('useSurveyJSDropdown', () => {
  test('should handle item selection', () => {
    const items = [{ id: '1', name: 'Toyota' }];
    const onSelect = jest.fn();
    
    const { result } = renderHook(() => useSurveyJSDropdown(items, onSelect));
    
    act(() => {
      result.current.handleSelect(items[0]);
    });
    
    expect(onSelect).toHaveBeenCalledWith(items[0]);
    expect(result.current.selectedItem).toEqual(items[0]);
  });
});
```

## 🎯 Key Learnings

### 1. State Management
- Multiple state variables for complex UI components
- Proper cleanup on component unmount
- State synchronization between related components

### 2. UX Design
- Progressive disclosure reduces cognitive load
- Visual feedback improves user experience
- Error prevention better than error handling

### 3. Performance
- Debouncing prevents excessive re-renders
- Memoization optimizes expensive operations
- Virtual scrolling handles large datasets

### 4. Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

## 📚 Resources

- [React Patterns](https://reactpatterns.com/)
- [UX Design Principles](https://www.nngroup.com/)
- [Automotive UX Guidelines](https://www.w3.org/WAI/mobile/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Last Updated:** May 31, 2026  
**Version:** 1.0  
**Project:** POS+Stock Tire Shop System
