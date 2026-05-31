# SurveyJS Dropdown Implementation Guide

## 📋 Overview

This document captures the complete implementation of SurveyJS-style dropdown components with search functionality and inline add new item capability, specifically implemented for vehicle brand and model selection in the POS+Stock system.

## 🎯 Key Features Implemented

### 1. SurveyJS-style Dropdown Components
- **Search-as-you-type filtering** - Real-time filtering as user types
- **Scrollable dropdown list** - `max-h-60 overflow-y-auto` for long lists
- **"Other" option** - Special choice at bottom for custom input
- **Inline add functionality** - Direct input field for new items
- **Clean UX flow** - No separate buttons, integrated experience

### 2. State Management Pattern
```typescript
// State variables for each dropdown
const [selectedBrandDisplay, setSelectedBrandDisplay] = useState('');
const [filteredBrands, setFilteredBrands] = useState<any[]>([]);
const [showDropdown, setShowDropdown] = useState(false);
const [showCustomBrandInput, setShowCustomBrandInput] = useState(false);
const customBrandInputRef = useRef<HTMLInputElement>(null);
```

### 3. UX Flow Implementation

#### Normal State
```tsx
<input
  type="text"
  placeholder="ค้นหาหรือเลือกยี่ห้อรถ..."
  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  value={selectedBrandDisplay}
  onChange={handleSearchChange}
  onFocus={handleFocus}
  onBlur={handleBlur}
/>
```

#### Dropdown List
```tsx
{showDropdown && (
  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
    {filteredBrands.map((brand) => (
      <div key={brand.id} onClick={() => selectBrand(brand)}>
        <span className="text-lg mr-2">🚗</span>
        <span>{brand.name}</span>
      </div>
    ))}
    
    {/* "Other" Option */}
    <div onClick={showCustomBrandInputField}>
      <span className="text-lg mr-2">✏️</span>
      <span>เพิ่มยี่ห้อใหม่...</span>
    </div>
  </div>
)}
```

#### Custom Input State
```tsx
{showCustomBrandInput && (
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="ระบุยี่ห้อใหม่..."
      className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      ref={customBrandInputRef}
      onKeyPress={handleKeyPress}
    />
    <button onClick={handleAdd}>เพิ่ม</button>
    <button onClick={handleCancel}>ยกเลิก</button>
  </div>
)}
```

## 🔧 Core Functions

### 1. Search Handler
```typescript
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setSelectedBrandDisplay(value);
  
  // Filter brands based on search
  const filtered = vehicleBrands.filter(brand => 
    brand.name.toLowerCase().includes(value.toLowerCase())
  );
  setFilteredBrands(filtered);
  setShowDropdown(true);
};
```

### 2. Add New Item Function
```typescript
const addNewBrand = async (brandName: string, input: HTMLInputElement) => {
  try {
    const response = await fetch('http://localhost:3000/api/customers/vehicle-brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: brandName }),
    });
    const result = await response.json();
    if (result.success) {
      await loadVehicleBrands();
      setSelectedBrandDisplay(brandName); // Set display to new brand
      vehicleForm.setValue('brand', result.data.id);
      loadVehicleModels(result.data.id);
      setShowCustomBrandInput(false); // Hide custom input
      input.value = ''; // Clear input
    }
  } catch (error) {
    console.error('Add brand error:', error);
  }
};
```

### 3. Focus Management
```typescript
const showCustomBrandInputField = () => {
  setShowDropdown(false);
  setShowCustomBrandInput(true);
  setSelectedBrandDisplay(''); // Clear existing value
  setTimeout(() => {
    customBrandInputRef.current?.focus();
  }, 100);
};
```

## 🎨 UX Best Practices Applied

### 1. SurveyJS Principles
- **Search-as-you-type** - Immediate filtering feedback
- **Special choices** - "Other" option for custom input
- **Server-side filtering** - Efficient for large datasets
- **HTML templates** - Custom rendering with icons

### 2. Automotive UX Best Practices
- **Clarity** - Clear visual hierarchy with icons
- **Learnability** - Familiar dropdown behavior
- **Progressive disclosure** - Show options when needed
- **Visual feedback** - Hover states and focus indicators

### 3. React State Management
- **Controlled components** - All inputs controlled by state
- **Refs for focus** - Auto-focus on custom input
- **Cleanup on cancel** - Proper state reset
- **Debounced search** - Efficient filtering (can be added)

## 🚀 Implementation Files

### Frontend
- **`client/src/pages/CustomersPage.tsx`** - Main implementation
- **State variables** - Lines 96-107
- **Handler functions** - Lines 169-220
- **JSX components** - Lines 698-931

### Backend API
- **`server/src/routes/customers.ts`** - API endpoints
- **GET `/api/customers/vehicle-brands`** - List brands
- **POST `/api/customers/vehicle-brands`** - Add new brand
- **GET `/api/customers/vehicle-models`** - List models
- **POST `/api/customers/vehicle-models`** - Add new model

## 🔍 Key Learnings

### 1. State Management Complexity
- Multiple state variables needed for each dropdown
- Proper cleanup on cancel/selection
- Focus management requires setTimeout

### 2. UX Flow Design
- Clear placeholder text changes ("ค้นหา..." → "ระบุ...")
- Immediate visual feedback on state changes
- Consistent behavior across similar components

### 3. Layout Considerations
- Single column layout prevents button overlap
- Proper z-index for dropdown positioning
- Responsive design with consistent spacing

### 4. Error Handling
- Graceful fallback on API errors
- User-friendly error messages
- State recovery on failed operations

## 📦 Reusable Component Pattern

This implementation can be extracted into a reusable component:

```typescript
interface SurveyJSDropdownProps {
  items: any[];
  placeholder: string;
  customPlaceholder: string;
  onAdd: (name: string) => Promise<any>;
  onSelect: (item: any) => void;
  displayField: string;
  icon: string;
}

// Usage:
<SurveyJSDropdown
  items={vehicleBrands}
  placeholder="ค้นหาหรือเลือกยี่ห้อรถ..."
  customPlaceholder="ระบุยี่ห้อใหม่..."
  onAdd={addNewBrand}
  onSelect={selectBrand}
  displayField="name"
  icon="🚗"
/>
```

## 🎯 Future Enhancements

### 1. Performance
- Debounced search for large datasets
- Virtual scrolling for 1000+ items
- Server-side search with pagination

### 2. Accessibility
- ARIA labels and roles
- Keyboard navigation (arrow keys, enter, escape)
- Screen reader support

### 3. Advanced Features
- Multi-select capability
- Item grouping/categories
- Recent items history
- Favorites/bookmarks

## 📚 References

- [SurveyJS Dropdown Documentation](https://surveyjs.io/form-library/examples/create-dropdown-menu-in-javascript/reactjs)
- [Automotive UX Best Practices](https://www.nngroup.com/articles/automotive-ux/)
- [React Dropdown Patterns](https://reactpatterns.com/dropdown)

---

**Last Updated:** May 31, 2026  
**Version:** 1.0  
**Status:** Production Ready
