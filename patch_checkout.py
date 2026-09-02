import re

path = '/Users/hassanchawa/modern e commerce/src/pages/store/CheckoutPage.jsx'

with open(path, 'r') as f:
    content = f.read()

# Replace handleSaveAddress
new_handle = """  async function handleSaveAddress() {
    if (!newAddr.title || newAddr.title.length < 2) return toast.error('Title must be at least 2 characters')
    if (!newAddr.recipient_name || newAddr.recipient_name.length < 2) return toast.error('Name must be at least 2 characters')
    if (!newAddr.phone || newAddr.phone.length < 10) return toast.error('Phone must be at least 10 characters')
    if (!newAddr.city || newAddr.city.length < 2) return toast.error('City is required')
    if (!newAddr.district || newAddr.district.length < 2) return toast.error('District is required')
    if (!newAddr.full_address || newAddr.full_address.length < 5) return toast.error('Full address must be at least 5 characters')

    try {
      const addr = await addressService.create(newAddr)
      setAddresses(prev => [...prev, addr])
      setSelectedAddress(addr.id)
      setShowNewAddr(false)
      setNewAddr({ title: '', recipient_name: '', phone: '', city: '', district: '', full_address: '', postal_code: '', is_default: false })
      toast.success('Address saved!')
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Could not save address'
      toast.error('Error: ' + msg)
    }
  }"""

# Using regex to replace the old handleSaveAddress
content = re.sub(
    r'  async function handleSaveAddress\(\) \{\s*try \{\s*const addr = await addressService\.create\(newAddr\).*?\} catch \{ toast\.error\(\'Could not save address\'\) \}\s*\}',
    new_handle,
    content,
    flags=re.DOTALL
)

with open(path, 'w') as f:
    f.write(content)
print("Checkout patched")
