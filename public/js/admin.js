const deleteProduct = (btn) => {
    const pid = btn.parentNode.querySelector('[name=productId]').value
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value
    const elementToDelete = btn.closest('article')
    fetch("/admin/products/"+pid,{
        method:"delete",
        headers: {
            'csrf-token': csrf
        }
    }).then(result =>{
        return (result.json())
    }).then(data => {
        console.log(data)
        elementToDelete.parentNode.removeChild(elementToDelete);
    })
    .catch(err => {
        console.log(err)
    })
}