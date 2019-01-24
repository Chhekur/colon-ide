
function makeMyDirectoryTree(structure){
    console.log(structure);
    let response = '<ul class="file-tree"><li><a href="#"><span class = "label">' + structure.name + '</span></a></li></ul>';
    $('#project-structure').html(response);
    $(".file-tree").filetree();
}